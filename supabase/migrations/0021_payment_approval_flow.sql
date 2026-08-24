-- 0021_payment_approval_flow.sql

do $$ begin
  create type public.payment_status as enum ('PENDING', 'CONFIRMED', 'REJECTED');
exception when duplicate_object then null; end $$;

alter table public.payments 
  add column if not exists status public.payment_status not null default 'CONFIRMED';

-- Update compute_loan_ledger to only include CONFIRMED payments
do $$ begin
  drop function if exists public.get_loan_ledger(uuid) cascade;
  drop function if exists public.compute_loan_ledger(uuid, date) cascade;
  drop function if exists public.compute_loan_ledger cascade;
exception when others then null; end $$;

create or replace function public.compute_loan_ledger(
  p_loan_id uuid,
  p_as_of date default current_date
)
returns table (
  as_of date,
  principal numeric,
  unpaid_interest numeric,
  outstanding numeric,
  total_interest_accrued numeric,
  total_paid numeric,
  status public.loan_status,
  is_overdue boolean,
  is_partially_paid boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan public.loans%rowtype;
  v_curr_date date;
  v_curr_principal numeric;
  v_curr_unpaid_interest numeric;
  v_total_accrued numeric := 0;
  v_total_paid numeric := 0;
  p record;
  v_eff_as_of date;
  v_segment_interest numeric;
begin
  select * into v_loan from public.loans where id = p_loan_id;
  if v_loan.id is null then
    raise exception 'loan not found';
  end if;

  v_curr_principal := v_loan.principal_amount;
  v_curr_unpaid_interest := 0;
  v_curr_date := v_loan.start_date;
  v_eff_as_of := coalesce(p_as_of, current_date);

  -- Only include CONFIRMED payments in ledger calculations
  for p in (
    select * from public.payments
    where payments.loan_id = p_loan_id
      and payments.status = 'CONFIRMED'
      and payments.payment_date <= v_eff_as_of
    order by payments.payment_date asc, payments.created_at asc
  ) loop
    if p.payment_date > v_curr_date then
      v_segment_interest := public.accrue_interest(
        v_loan.interest_type,
        v_loan.interest_rate,
        v_loan.interest_frequency,
        v_loan.compounding,
        v_curr_principal,
        v_curr_date,
        p.payment_date
      );
      v_curr_unpaid_interest := v_curr_unpaid_interest + v_segment_interest;
      v_total_accrued := v_total_accrued + v_segment_interest;
      v_curr_date := p.payment_date;
    end if;

    v_curr_unpaid_interest := greatest(0, v_curr_unpaid_interest - p.interest_component);
    v_curr_principal := greatest(0, v_curr_principal - p.principal_component);
    v_total_paid := v_total_paid + p.amount;
  end loop;

  if v_eff_as_of > v_curr_date and (v_loan.status <> 'PAID' or v_loan.paid_off_date is null or v_eff_as_of <= v_loan.paid_off_date) then
    v_segment_interest := public.accrue_interest(
      v_loan.interest_type,
      v_loan.interest_rate,
      v_loan.interest_frequency,
      v_loan.compounding,
      v_curr_principal,
      v_curr_date,
      v_eff_as_of
    );
    v_curr_unpaid_interest := v_curr_unpaid_interest + v_segment_interest;
    v_total_accrued := v_total_accrued + v_segment_interest;
  end if;

  as_of := v_eff_as_of;
  principal := round(v_curr_principal, 2);
  unpaid_interest := round(v_curr_unpaid_interest, 2);
  outstanding := round(v_curr_principal + v_curr_unpaid_interest, 2);
  total_interest_accrued := round(v_total_accrued, 2);
  total_paid := round(v_total_paid, 2);
  status := v_loan.status;
  is_overdue := (v_loan.status = 'ACTIVE') and (v_eff_as_of > v_loan.due_date) and (outstanding > 0);
  is_partially_paid := (total_paid > 0) and (outstanding > 0);
  return next;
end;
$$;

create or replace function public.get_loan_ledger(p_loan_id uuid)
returns table (
  outstanding numeric,
  principal_remaining numeric,
  unpaid_interest numeric,
  is_overdue boolean,
  is_partially_paid boolean,
  status public.loan_status
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan public.loans%rowtype;
  v_ledger record;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select * into v_loan from public.loans where id = p_loan_id;
  if v_loan.id is null then
    raise exception 'loan not found';
  end if;

  if auth.uid() not in (v_loan.lender_id, v_loan.borrower_id) then
    raise exception 'not a participant of this loan';
  end if;

  select * into v_ledger from public.compute_loan_ledger(p_loan_id, current_date);

  outstanding := v_ledger.outstanding;
  principal_remaining := v_ledger.principal;
  unpaid_interest := v_ledger.unpaid_interest;
  is_overdue := v_ledger.is_overdue;
  is_partially_paid := v_ledger.is_partially_paid;
  status := v_loan.status;
  return next;
end;
$$;

revoke all on function public.get_loan_ledger(uuid) from public;
grant execute on function public.get_loan_ledger(uuid) to authenticated;

-- Update record_payment to set status = 'PENDING' when recorded by borrower
create or replace function public.record_payment(
  p_loan_id uuid,
  p_amount numeric,
  p_payment_date date,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_viewer uuid := auth.uid();
  v_loan public.loans%rowtype;
  v_unpaid_interest_before numeric;
  v_principal_before numeric;
  v_interest_component numeric;
  v_principal_component numeric;
  v_overpaid_excess numeric;
  v_payment_id uuid;
  v_initial_status public.payment_status;
begin
  if v_viewer is null then
    raise exception 'authentication required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be greater than zero';
  end if;

  if p_payment_date is null then
    raise exception 'payment date is required';
  end if;

  select * into v_loan from public.loans where id = p_loan_id for update;
  if v_loan.id is null then
    raise exception 'loan not found';
  end if;

  if v_viewer not in (v_loan.borrower_id, v_loan.lender_id) then
    raise exception 'not a participant of this loan';
  end if;

  if v_loan.status <> 'ACTIVE' then
    raise exception 'payment can only be recorded on active loans';
  end if;

  if p_payment_date < v_loan.start_date then
    raise exception 'payment date cannot be before the loan start date';
  end if;

  -- If recorded by lender, auto-confirm; if recorded by borrower, set PENDING
  if v_viewer = v_loan.lender_id then
    v_initial_status := 'CONFIRMED';
  else
    v_initial_status := 'PENDING';
  end if;

  -- Estimate component split
  select compute.principal, compute.unpaid_interest
    into v_principal_before, v_unpaid_interest_before
    from public.compute_loan_ledger(p_loan_id, p_payment_date) compute;

  v_interest_component := least(p_amount, v_unpaid_interest_before);
  v_principal_component := least(p_amount - v_interest_component, v_principal_before);
  v_overpaid_excess := p_amount - v_interest_component - v_principal_component;

  insert into public.payments (
    loan_id, payer_id, receiver_id, amount,
    interest_component, principal_component, overpaid_excess,
    payment_date, note, status
  ) values (
    p_loan_id, v_loan.borrower_id, v_loan.lender_id, p_amount,
    v_interest_component, v_principal_component, v_overpaid_excess,
    p_payment_date, p_note, v_initial_status
  ) returning id into v_payment_id;

  -- Notify lender or borrower
  if v_initial_status = 'PENDING' then
    insert into public.notifications (user_id, type, payload) values
      (v_loan.lender_id, 'payment_recorded', jsonb_build_object(
        'loan_id', p_loan_id,
        'payment_id', v_payment_id,
        'amount', p_amount,
        'requires_approval', true
      ));
  else
    insert into public.notifications (user_id, type, payload) values
      (v_loan.borrower_id, 'payment_recorded', jsonb_build_object(
        'loan_id', p_loan_id,
        'payment_id', v_payment_id,
        'amount', p_amount,
        'confirmed', true
      ));
  end if;

  return v_payment_id;
end;
$$;

-- confirm_payment RPC (Lender only)
create or replace function public.confirm_payment(p_payment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_viewer uuid := auth.uid();
  v_payment public.payments%rowtype;
  v_loan public.loans%rowtype;
  v_new_outstanding numeric;
begin
  if v_viewer is null then
    raise exception 'authentication required';
  end if;

  select * into v_payment from public.payments where id = p_payment_id for update;
  if v_payment.id is null then
    raise exception 'payment not found';
  end if;

  if v_viewer <> v_payment.receiver_id then
    raise exception 'only the lender can confirm this payment';
  end if;

  if v_payment.status <> 'PENDING' then
    raise exception 'payment is not pending confirmation';
  end if;

  select * into v_loan from public.loans where id = v_payment.loan_id for update;

  update public.payments set status = 'CONFIRMED' where id = p_payment_id;

  -- Recompute ledger
  select compute.outstanding
    into v_new_outstanding
    from public.compute_loan_ledger(v_payment.loan_id, current_date) compute;

  if v_new_outstanding <= 0 then
    update public.loans
    set status = 'PAID', paid_off_date = v_payment.payment_date, updated_at = now()
    where id = v_payment.loan_id;

    insert into public.notifications (user_id, type, payload) values
      (v_loan.lender_id, 'fully_paid', jsonb_build_object('loan_id', v_payment.loan_id)),
      (v_loan.borrower_id, 'fully_paid', jsonb_build_object('loan_id', v_payment.loan_id));
  else
    insert into public.notifications (user_id, type, payload) values
      (v_loan.borrower_id, 'payment_recorded', jsonb_build_object(
        'loan_id', v_payment.loan_id,
        'payment_id', p_payment_id,
        'amount', v_payment.amount,
        'confirmed', true
      ));
  end if;
end;
$$;

-- reject_payment RPC (Lender only)
create or replace function public.reject_payment(p_payment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_viewer uuid := auth.uid();
  v_payment public.payments%rowtype;
begin
  if v_viewer is null then
    raise exception 'authentication required';
  end if;

  select * into v_payment from public.payments where id = p_payment_id for update;
  if v_payment.id is null then
    raise exception 'payment not found';
  end if;

  if v_viewer <> v_payment.receiver_id then
    raise exception 'only the lender can reject this payment';
  end if;

  if v_payment.status <> 'PENDING' then
    raise exception 'payment is not pending confirmation';
  end if;

  update public.payments set status = 'REJECTED' where id = p_payment_id;

  insert into public.notifications (user_id, type, payload) values
    (v_payment.payer_id, 'payment_recorded', jsonb_build_object(
      'loan_id', v_payment.loan_id,
      'payment_id', p_payment_id,
      'amount', v_payment.amount,
      'rejected', true
    ));
end;
$$;

revoke all on function public.confirm_payment(uuid) from public;
grant execute on function public.confirm_payment(uuid) to authenticated;

revoke all on function public.reject_payment(uuid) from public;
grant execute on function public.reject_payment(uuid) to authenticated;

-- record_payment(loan_id, amount, payment_date, note): the only mutation
-- path onto `payments`. Deliberately accepts no interest/principal/
-- outstanding value from the caller — those are always computed here from
-- compute_loan_ledger(), never trusted from the client.

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
  v_loan public.loans%rowtype;
  v_ledger record;
  v_post_ledger record;
  v_interest_component numeric;
  v_principal_component numeric;
  v_overpaid numeric;
  v_payment_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be greater than zero';
  end if;

  if p_payment_date is null or p_payment_date > current_date then
    raise exception 'payment date cannot be in the future';
  end if;

  select * into v_loan from public.loans where id = p_loan_id for update;
  if v_loan.id is null then
    raise exception 'loan not found';
  end if;

  if auth.uid() <> v_loan.borrower_id then
    raise exception 'only the borrower can record a payment';
  end if;

  if v_loan.status <> 'ACTIVE' then
    raise exception 'loan is not active';
  end if;

  if p_payment_date < v_loan.start_date then
    raise exception 'payment date cannot be before the loan start date';
  end if;

  select * into v_ledger from public.compute_loan_ledger(p_loan_id, p_payment_date);

  v_interest_component := least(p_amount, v_ledger.unpaid_interest);
  v_principal_component := least(p_amount - v_interest_component, v_ledger.principal_remaining);
  v_overpaid := p_amount - v_interest_component - v_principal_component;

  insert into public.payments (
    loan_id, payer_id, receiver_id, amount,
    interest_component, principal_component, overpaid_excess,
    payment_date, note
  ) values (
    p_loan_id, v_loan.borrower_id, v_loan.lender_id, p_amount,
    v_interest_component, v_principal_component, v_overpaid,
    p_payment_date, p_note
  )
  returning id into v_payment_id;

  insert into public.notifications (user_id, type, payload) values
    (v_loan.lender_id, 'payment_recorded', jsonb_build_object(
      'loan_id', p_loan_id, 'payment_id', v_payment_id, 'amount', p_amount
    ));

  select * into v_post_ledger from public.compute_loan_ledger(p_loan_id, p_payment_date);

  if v_post_ledger.outstanding <= 0 then
    update public.loans
    set status = 'PAID', paid_off_date = p_payment_date, updated_at = now()
    where id = p_loan_id;

    insert into public.notifications (user_id, type, payload) values
      (v_loan.lender_id, 'fully_paid', jsonb_build_object('loan_id', p_loan_id)),
      (v_loan.borrower_id, 'fully_paid', jsonb_build_object('loan_id', p_loan_id));
  end if;

  return v_payment_id;
end;
$$;

revoke all on function public.record_payment(uuid, numeric, date, text) from public;
grant execute on function public.record_payment(uuid, numeric, date, text) to authenticated;

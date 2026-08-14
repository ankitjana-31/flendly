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
  v_outstanding_before numeric;
  v_interest_component numeric;
  v_principal_component numeric;
  v_overpaid_excess numeric;
  v_payment_id uuid;
  v_new_outstanding numeric;
begin
  if v_viewer is null then
    raise exception 'authentication required';
  end if;

  -- Lock loan row to serialize payment transactions
  select * into v_loan from public.loans
  where id = p_loan_id
  for update;

  if v_loan.id is null then
    raise exception 'loan not found';
  end if;

  if v_viewer <> v_loan.borrower_id then
    raise exception 'only the borrower can record a payment';
  end if;

  if v_loan.status <> 'ACTIVE' then
    raise exception 'payment can only be recorded on active loans';
  end if;

  if p_amount <= 0 then
    raise exception 'payment amount must be greater than zero';
  end if;

  if p_payment_date > current_date then
    raise exception 'payment date cannot be in the future';
  end if;

  if p_payment_date < v_loan.start_date then
    raise exception 'payment date cannot be before the loan start date';
  end if;

  -- Compute the ledger status up to the payment date (including existing payments before this date)
  select compute.outstanding, compute.principal, compute.unpaid_interest
    into v_outstanding_before, v_principal_before, v_unpaid_interest_before
    from public.compute_loan_ledger(p_loan_id, p_payment_date) compute;

  -- Interest-first allocation
  v_interest_component := least(p_amount, v_unpaid_interest_before);
  v_principal_component := least(p_amount - v_interest_component, v_principal_before);
  v_overpaid_excess := p_amount - v_interest_component - v_principal_component;

  -- Insert payment record
  insert into public.payments (
    loan_id, payer_id, receiver_id, amount,
    interest_component, principal_component, overpaid_excess,
    payment_date, note
  ) values (
    p_loan_id, v_loan.borrower_id, v_loan.lender_id, p_amount,
    v_interest_component, v_principal_component, v_overpaid_excess,
    p_payment_date, p_note
  ) returning id into v_payment_id;

  -- Compute new outstanding balance
  select compute.outstanding
    into v_new_outstanding
    from public.compute_loan_ledger(p_loan_id, p_payment_date) compute;

  -- If fully paid, transition loan to PAID
  if v_new_outstanding <= 0 then
    update public.loans
    set status = 'PAID', paid_off_date = p_payment_date, updated_at = now()
    where id = p_loan_id;

    insert into public.notifications (user_id, type, payload) values
      (v_loan.lender_id, 'fully_paid', jsonb_build_object('loan_id', p_loan_id)),
      (v_loan.borrower_id, 'fully_paid', jsonb_build_object('loan_id', p_loan_id));
  end if;

  -- Notify lender of payment
  insert into public.notifications (user_id, type, payload) values
    (v_loan.lender_id, 'payment_recorded', jsonb_build_object(
      'loan_id', p_loan_id,
      'payment_id', v_payment_id,
      'amount', p_amount
    ));

  return v_payment_id;
end;
$$;

revoke all on function public.record_payment(uuid, numeric, date, text) from public;
grant execute on function public.record_payment(uuid, numeric, date, text) to authenticated;

create or replace function public.accept_offer(p_offer_id uuid)
returns uuid  -- returns new loan id
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer public.loan_offers%rowtype;
  v_request public.loan_requests%rowtype;
  v_lender uuid;
  v_borrower uuid;
  v_loan_id uuid;
begin
  select * into v_request from public.loan_requests
    where id = (select request_id from public.loan_offers where id = p_offer_id)
    for update;  -- serializes concurrent acceptance attempts

  if v_request.id is null then
    raise exception 'request not found';
  end if;
  if auth.uid() not in (v_request.sender_id, v_request.receiver_id) then
    raise exception 'not a participant';
  end if;
  if v_request.status not in ('PENDING','COUNTERED') then
    raise exception 'request is not open for acceptance';
  end if;

  select * into v_offer from public.loan_offers where id = p_offer_id;
  if v_offer.status <> 'ACTIVE' then
    raise exception 'offer is not active';
  end if;

  -- direction determines who lends / who borrows
  if v_request.direction = 'lend' then
    v_lender := v_request.sender_id;
    v_borrower := v_request.receiver_id;
  else
    v_lender := v_request.receiver_id;
    v_borrower := v_request.sender_id;
  end if;

  update public.loan_offers set status = 'ACCEPTED' where id = p_offer_id;

  insert into public.loans (
    request_id, accepted_offer_id, lender_id, borrower_id,
    principal_amount, interest_type, interest_rate, interest_frequency,
    compounding, start_date, due_date
  ) values (
    v_request.id, v_offer.id, v_lender, v_borrower,
    v_offer.amount, v_offer.interest_type, v_offer.interest_rate,
    v_offer.interest_frequency, v_offer.compounding, current_date, v_offer.deadline
  ) returning id into v_loan_id;

  update public.loan_requests set status = 'ACCEPTED', updated_at = now() where id = v_request.id;

  insert into public.notifications (user_id, type, payload) values
    (v_lender, 'offer_accepted', jsonb_build_object('loan_id', v_loan_id, 'request_id', v_request.id)),
    (v_borrower, 'offer_accepted', jsonb_build_object('loan_id', v_loan_id, 'request_id', v_request.id));

  return v_loan_id;
end;
$$;

revoke all on function public.accept_offer(uuid) from public;
grant execute on function public.accept_offer(uuid) to authenticated;

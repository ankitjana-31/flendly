-- 0024_auto_cancel_expired_requests.sql
-- Automatically cancel unaccepted loan requests whose active offer deadline has passed.
-- Prevent accepting expired offers and ensure no overdue reminders apply to unaccepted requests.

create or replace function public.auto_cancel_expired_requests()
returns integer
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_cancelled_count integer := 0;
begin
  -- Update requests whose active offer has passed its deadline and request is still open
  with expired_requests as (
    select r.id as request_id, o.id as offer_id
    from public.loan_requests r
    join public.loan_offers o on o.request_id = r.id and o.status = 'ACTIVE'
    where r.status in ('PENDING', 'COUNTERED')
      and o.deadline < current_date
  ),
  updated_requests as (
    update public.loan_requests
    set status = 'CANCELLED',
        updated_at = now()
    where id in (select request_id from expired_requests)
    returning id
  ),
  updated_offers as (
    update public.loan_offers
    set status = 'DECLINED'
    where id in (select offer_id from expired_requests)
    returning id
  )
  select count(*) into v_cancelled_count from updated_requests;

  return v_cancelled_count;
end;
$func$;

revoke all on function public.auto_cancel_expired_requests() from public;
grant execute on function public.auto_cancel_expired_requests() to authenticated, service_role;

-- Update accept_offer to strictly disallow accepting expired offers
create or replace function public.accept_offer(p_offer_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_offer public.loan_offers%rowtype;
  v_request public.loan_requests%rowtype;
  v_lender uuid;
  v_borrower uuid;
  v_loan_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select * into v_offer from public.loan_offers where id = p_offer_id;
  if v_offer.id is null then
    raise exception 'offer not found';
  end if;

  select * into v_request
  from public.loan_requests
  where id = v_offer.request_id
  for update;

  if v_request.id is null then
    raise exception 'request not found';
  end if;

  if auth.uid() not in (v_request.sender_id, v_request.receiver_id) then
    raise exception 'not a participant of this request';
  end if;

  if v_request.status not in ('PENDING', 'COUNTERED') then
    raise exception 'request is not open for acceptance';
  end if;

  if v_offer.status <> 'ACTIVE' then
    raise exception 'offer is not active';
  end if;

  -- Deadline check: If deadline is in the past, auto-cancel the request and reject acceptance
  if v_offer.deadline < current_date then
    update public.loan_offers set status = 'DECLINED' where id = p_offer_id;
    update public.loan_requests set status = 'CANCELLED', updated_at = now() where id = v_request.id;
    raise exception 'This proposal deadline has passed. The request has been auto-cancelled.';
  end if;

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
  )
  returning id into v_loan_id;

  update public.loan_requests
  set status = 'ACCEPTED', updated_at = now()
  where id = v_request.id;

  insert into public.notifications (user_id, type, payload) values
    (v_lender, 'offer_accepted', jsonb_build_object('loan_id', v_loan_id, 'request_id', v_request.id)),
    (v_borrower, 'offer_accepted', jsonb_build_object('loan_id', v_loan_id, 'request_id', v_request.id));

  return v_loan_id;
end;
$func$;

revoke all on function public.accept_offer(uuid) from public;
grant execute on function public.accept_offer(uuid) to authenticated;

-- Update send_deadline_reminders to trigger auto-cancel first, and strictly only check ACTIVE confirmed loans
create or replace function public.send_deadline_reminders()
returns table (reminders_sent integer, overdue_sent integer)
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_loan record;
  v_ledger record;
  v_reminders integer := 0;
  v_overdue integer := 0;
  v_already_reminded boolean;
  v_already_overdue boolean;
begin
  -- 1. Auto-cancel any unaccepted requests that have passed their deadline
  perform public.auto_cancel_expired_requests();

  -- 2. Scan strictly ACTIVE loans (already accepted) with positive outstanding
  for v_loan in
    select * from public.loans
    where status = 'ACTIVE'
      and due_date >= current_date - interval '365 days'
  loop
    select * into v_ledger from public.compute_loan_ledger(v_loan.id, current_date);
    if v_ledger.outstanding <= 0 then
      continue;
    end if;

    -- upcoming deadline, within 3 days, not yet reminded
    if v_loan.due_date - current_date between 0 and 3 then
      select exists(
        select 1 from public.notifications
        where type = 'deadline_reminder'
          and payload ->> 'loan_id' = v_loan.id::text
      ) into v_already_reminded;

      if not v_already_reminded then
        insert into public.notifications (user_id, type, payload) values
          (v_loan.borrower_id, 'deadline_reminder', jsonb_build_object('loan_id', v_loan.id, 'due_date', v_loan.due_date)),
          (v_loan.lender_id, 'deadline_reminder', jsonb_build_object('loan_id', v_loan.id, 'due_date', v_loan.due_date));
        v_reminders := v_reminders + 1;
      end if;
    end if;

    -- overdue active loans, not yet flagged
    if current_date > v_loan.due_date then
      select exists(
        select 1 from public.notifications
        where type = 'overdue'
          and payload ->> 'loan_id' = v_loan.id::text
      ) into v_already_overdue;

      if not v_already_overdue then
        insert into public.notifications (user_id, type, payload) values
          (v_loan.borrower_id, 'overdue', jsonb_build_object('loan_id', v_loan.id, 'due_date', v_loan.due_date)),
          (v_loan.lender_id, 'overdue', jsonb_build_object('loan_id', v_loan.id, 'due_date', v_loan.due_date));
        v_overdue := v_overdue + 1;
      end if;
    end if;
  end loop;

  reminders_sent := v_reminders;
  overdue_sent := v_overdue;
  return next;
end;
$func$;

revoke all on function public.send_deadline_reminders() from public, authenticated;

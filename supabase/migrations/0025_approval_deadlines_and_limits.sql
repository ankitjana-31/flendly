-- 0025_approval_deadlines_and_limits.sql
-- Enforce 12h/24h request approval deadlines and ?1,00,000 maximum amount safety constraint

-- 1. Ensure loan offers do not exceed ?1,00,000
alter table public.loan_offers
  drop constraint if exists loan_offers_amount_max_check;

alter table public.loan_offers
  add constraint loan_offers_amount_max_check
  check (amount > 0 and amount <= 100000.00);

-- 2. Update auto_cancel_expired_requests to support 12h/24h approval window
create or replace function public.auto_cancel_expired_requests()
returns integer
language plpgsql
security definer
set search_path = public
as $
declare
  v_cancelled_count integer := 0;
begin
  with expired_requests as (
    select r.id as request_id, o.id as offer_id
    from public.loan_requests r
    join public.loan_offers o on o.request_id = r.id and o.status = 'ACTIVE'
    where r.status in ('PENDING', 'COUNTERED')
      and (
        -- Repayment deadline date in past
        o.deadline < current_date
        -- OR approval window expired: 12h if repayment is within 2 days, 24h otherwise
        or now() > (
          o.created_at + case 
            when (o.deadline - o.created_at::date) <= 2 then interval '12 hours' 
            else interval '24 hours' 
          end
        )
      )
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
$;

revoke all on function public.auto_cancel_expired_requests() from public;
grant execute on function public.auto_cancel_expired_requests() to authenticated, service_role;

-- 3. Update accept_offer to strictly verify the approval window
create or replace function public.accept_offer(p_offer_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $
declare
  v_offer public.loan_offers%rowtype;
  v_request public.loan_requests%rowtype;
  v_lender uuid;
  v_borrower uuid;
  v_loan_id uuid;
  v_approval_hours interval;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select * into v_offer
  from public.loan_offers
  where id = p_offer_id
  for update;

  if not found then
    raise exception 'offer not found';
  end if;

  if v_offer.status <> 'ACTIVE' then
    raise exception 'offer is not active';
  end if;

  select * into v_request
  from public.loan_requests
  where id = v_offer.request_id
  for update;

  if not found then
    raise exception 'request not found';
  end if;

  if v_request.status not in ('PENDING', 'COUNTERED') then
    raise exception 'request is not open';
  end if;

  -- Verify 12h / 24h approval deadline
  v_approval_hours := case 
    when (v_offer.deadline - v_offer.created_at::date) <= 2 then interval '12 hours' 
    else interval '24 hours' 
  end;

  if now() > (v_offer.created_at + v_approval_hours) or v_offer.deadline < current_date then
    update public.loan_requests set status = 'CANCELLED', updated_at = now() where id = v_request.id;
    update public.loan_offers set status = 'DECLINED' where id = v_offer.id;
    raise exception 'this proposal approval deadline has expired';
  end if;

  if auth.uid() = v_offer.created_by then
    raise exception 'cannot accept your own offer';
  end if;

  if auth.uid() not in (v_request.sender_id, v_request.receiver_id) then
    raise exception 'not a participant in this request';
  end if;

  if v_request.direction = 'lend' then
    v_lender := v_request.sender_id;
    v_borrower := v_request.receiver_id;
  else
    v_lender := v_request.receiver_id;
    v_borrower := v_request.sender_id;
  end if;

  insert into public.loans (
    request_id,
    lender_id,
    borrower_id,
    principal_amount,
    interest_type,
    interest_rate,
    interest_frequency,
    compounding,
    repayment_deadline,
    status
  ) values (
    v_request.id,
    v_lender,
    v_borrower,
    v_offer.amount,
    v_offer.interest_type,
    v_offer.interest_rate,
    v_offer.interest_frequency,
    v_offer.compounding,
    v_offer.deadline,
    'ACTIVE'
  )
  returning id into v_loan_id;

  update public.loan_offers
  set status = 'ACCEPTED'
  where id = v_offer.id;

  update public.loan_requests
  set status = 'ACCEPTED',
      updated_at = now()
  where id = v_request.id;

  return v_loan_id;
end;
$;

revoke all on function public.accept_offer(uuid) from public;
grant execute on function public.accept_offer(uuid) to authenticated, service_role;

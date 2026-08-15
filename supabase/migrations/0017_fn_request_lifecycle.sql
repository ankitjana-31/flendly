-- Request lifecycle RPCs. `loan_requests` has no client UPDATE policy
-- (status changes go through RPCs only, per RLS in 0009); creation is an
-- RPC too so the request row and its initial offer are inserted in one
-- transaction rather than as two separate client round-trips.

create or replace function public.create_request(
  p_receiver_username text,
  p_direction public.request_direction,
  p_amount numeric,
  p_interest_type public.interest_type,
  p_interest_rate numeric,
  p_interest_frequency public.interest_frequency,
  p_compounding public.interest_frequency,
  p_deadline date,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender uuid := auth.uid();
  v_receiver uuid;
  v_request_id uuid;
begin
  if v_sender is null then
    raise exception 'authentication required';
  end if;

  select id into v_receiver
  from public.profiles
  where username_normalized = lower(trim(p_receiver_username));

  if v_receiver is null then
    raise exception 'no user found with that username';
  end if;

  if v_receiver = v_sender then
    raise exception 'you cannot send a request to yourself';
  end if;

  insert into public.loan_requests (sender_id, receiver_id, direction)
  values (v_sender, v_receiver, p_direction)
  returning id into v_request_id;

  insert into public.loan_offers (
    request_id, created_by, amount, interest_type, interest_rate,
    interest_frequency, compounding, deadline, message
  ) values (
    v_request_id, v_sender, p_amount, p_interest_type, p_interest_rate,
    p_interest_frequency, p_compounding, p_deadline, p_message
  );

  insert into public.notifications (user_id, type, payload)
  values (v_receiver, 'new_request', jsonb_build_object('request_id', v_request_id));

  return v_request_id;
end;
$$;

create or replace function public.decline_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.loan_requests%rowtype;
  v_active_offer uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select * into v_request from public.loan_requests where id = p_request_id for update;
  if v_request.id is null then
    raise exception 'request not found';
  end if;

  if auth.uid() not in (v_request.sender_id, v_request.receiver_id) then
    raise exception 'not a participant of this request';
  end if;

  if v_request.status not in ('PENDING', 'COUNTERED') then
    raise exception 'request is not open';
  end if;

  update public.loan_requests set status = 'DECLINED', updated_at = now() where id = p_request_id;

  select id into v_active_offer from public.loan_offers
  where request_id = p_request_id and status = 'ACTIVE';

  if v_active_offer is not null then
    update public.loan_offers set status = 'DECLINED' where id = v_active_offer;
  end if;

  insert into public.notifications (user_id, type, payload) values
    (v_request.sender_id, 'offer_declined', jsonb_build_object('request_id', p_request_id)),
    (v_request.receiver_id, 'offer_declined', jsonb_build_object('request_id', p_request_id));
end;
$$;

create or replace function public.cancel_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.loan_requests%rowtype;
  v_active_offer uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select * into v_request from public.loan_requests where id = p_request_id for update;
  if v_request.id is null then
    raise exception 'request not found';
  end if;

  if auth.uid() <> v_request.sender_id then
    raise exception 'only the sender can cancel this request';
  end if;

  if v_request.status not in ('PENDING', 'COUNTERED') then
    raise exception 'request is not open';
  end if;

  update public.loan_requests set status = 'CANCELLED', updated_at = now() where id = p_request_id;

  select id into v_active_offer from public.loan_offers
  where request_id = p_request_id and status = 'ACTIVE';

  if v_active_offer is not null then
    update public.loan_offers set status = 'DECLINED' where id = v_active_offer;
  end if;
end;
$$;

revoke all on function public.create_request(
  text, public.request_direction, numeric, public.interest_type, numeric,
  public.interest_frequency, public.interest_frequency, date, text
) from public;
revoke all on function public.decline_request(uuid) from public;
revoke all on function public.cancel_request(uuid) from public;

grant execute on function public.create_request(
  text, public.request_direction, numeric, public.interest_type, numeric,
  public.interest_frequency, public.interest_frequency, date, text
) to authenticated;
grant execute on function public.decline_request(uuid) to authenticated;
grant execute on function public.cancel_request(uuid) to authenticated;

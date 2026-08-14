create or replace function public.decline_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.loan_requests%rowtype;
begin
  select * into v_request from public.loan_requests
    where id = p_request_id
    for update;

  if v_request.id is null then
    raise exception 'request not found';
  end if;

  if auth.uid() not in (v_request.sender_id, v_request.receiver_id) then
    raise exception 'not authorized';
  end if;

  if v_request.status not in ('PENDING', 'COUNTERED') then
    raise exception 'request is not active';
  end if;

  update public.loan_requests
  set status = 'DECLINED', updated_at = now()
  where id = p_request_id;

  update public.loan_offers
  set status = 'DECLINED'
  where request_id = p_request_id and status = 'ACTIVE';
end;
$$;

revoke all on function public.decline_request(uuid) from public;
grant execute on function public.decline_request(uuid) to authenticated;


create or replace function public.cancel_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.loan_requests%rowtype;
begin
  select * into v_request from public.loan_requests
    where id = p_request_id
    for update;

  if v_request.id is null then
    raise exception 'request not found';
  end if;

  if auth.uid() <> v_request.sender_id then
    raise exception 'only the sender can cancel a request';
  end if;

  if v_request.status not in ('PENDING', 'COUNTERED') then
    raise exception 'request is not active';
  end if;

  update public.loan_requests
  set status = 'CANCELLED', updated_at = now()
  where id = p_request_id;

  update public.loan_offers
  set status = 'DECLINED'
  where request_id = p_request_id and status = 'ACTIVE';
end;
$$;

revoke all on function public.cancel_request(uuid) from public;
grant execute on function public.cancel_request(uuid) to authenticated;

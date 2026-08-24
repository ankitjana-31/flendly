-- Trigger for new loan request notifications
create or replace function public.notify_on_loan_request_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, payload)
  values (new.receiver_id, 'new_request', jsonb_build_object('request_id', new.id, 'sender_id', new.sender_id));
  return new;
end;
$$;

create trigger on_loan_request_inserted
  after insert on public.loan_requests
  for each row execute function public.notify_on_loan_request_insert();


-- Trigger for counter-offer notifications
create or replace function public.notify_on_active_offer_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.loan_requests%rowtype;
  v_recipient uuid;
begin
  if new.status <> 'ACTIVE' then
    return new;
  end if;

  select * into v_request from public.loan_requests where id = new.request_id;
  if v_request.id is not null then
    -- Send counter_offer notification only if this is not the initial offer
    if exists (
      select 1 from public.loan_offers
      where request_id = new.request_id and id <> new.id
    ) then
      v_recipient := case when new.created_by = v_request.sender_id then v_request.receiver_id else v_request.sender_id end;
      insert into public.notifications (user_id, type, payload)
      values (v_recipient, 'counter_offer', jsonb_build_object('request_id', new.request_id, 'offer_id', new.id));
    end if;
  end if;
  return new;
end;
$$;

create trigger on_loan_offer_inserted
  after insert on public.loan_offers
  for each row execute function public.notify_on_active_offer_insert();


-- Trigger for request decline and cancellation notifications
create or replace function public.notify_on_loan_request_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status in ('PENDING', 'COUNTERED') and new.status = 'DECLINED' then
    insert into public.notifications (user_id, type, payload) values
      (new.sender_id, 'offer_declined', jsonb_build_object('request_id', new.id)),
      (new.receiver_id, 'offer_declined', jsonb_build_object('request_id', new.id));
  elsif old.status in ('PENDING', 'COUNTERED') and new.status = 'CANCELLED' then
    -- When cancelled, notify the receiver
    insert into public.notifications (user_id, type, payload) values
      (new.receiver_id, 'offer_declined', jsonb_build_object('request_id', new.id, 'cancelled', true));
  end if;
  return new;
end;
$$;

create trigger on_loan_request_updated
  after update on public.loan_requests
  for each row execute function public.notify_on_loan_request_update();

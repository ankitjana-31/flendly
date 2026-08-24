-- counter_offer notifications. new_request/offer_declined are emitted
-- directly inside create_request/decline_request (0017); offer_accepted/
-- payment_recorded/fully_paid inside accept_offer/record_payment
-- (0014/0016) — those functions already have full context. The one event
-- not otherwise covered is a counter-offer landing on an already-negotiated
-- request, which fires from the loan_offers INSERT trigger chain.

create or replace function public.notify_counter_offer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.loan_requests%rowtype;
  v_recipient uuid;
  v_offer_count integer;
begin
  select count(*) into v_offer_count
  from public.loan_offers
  where request_id = new.request_id;

  -- first offer on the request: create_request() already sent new_request.
  if v_offer_count <= 1 then
    return new;
  end if;

  select * into v_request from public.loan_requests where id = new.request_id;

  v_recipient := case
    when new.created_by = v_request.sender_id then v_request.receiver_id
    else v_request.sender_id
  end;

  insert into public.notifications (user_id, type, payload)
  values (v_recipient, 'counter_offer', jsonb_build_object(
    'request_id', new.request_id, 'offer_id', new.id
  ));

  return new;
end;
$$;

-- Runs after the existing loan_offers_supersede_active (BEFORE INSERT)
-- trigger from 0003, so the row count already reflects this new offer.
drop trigger if exists loan_offers_notify_counter on public.loan_offers;
create trigger loan_offers_notify_counter
  after insert on public.loan_offers
  for each row execute function public.notify_counter_offer();

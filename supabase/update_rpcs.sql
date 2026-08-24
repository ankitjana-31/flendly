create or replace function public.get_profile_visible(target_id uuid)
returns table (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  email text,
  phone_number text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer uuid := auth.uid();
  is_participant boolean := false;
  p public.profiles%rowtype;
  s public.privacy_settings%rowtype;
begin
  if viewer is null then
    raise exception 'authentication required';
  end if;

  select * into p
  from public.profiles
  where profiles.id = target_id;

  if p.id is null then
    return;
  end if;

  select * into s
  from public.privacy_settings
  where privacy_settings.user_id = target_id;

  is_participant := (viewer = target_id) or exists (
    select 1
    from public.loan_requests
    where (sender_id = viewer and receiver_id = target_id)
       or (sender_id = target_id and receiver_id = viewer)
    union
    select 1
    from public.loans
    where (lender_id = viewer and borrower_id = target_id)
       or (lender_id = target_id and borrower_id = viewer)
  );

  return query select
    p.id,
    p.username,
    p.full_name,
    case
      when viewer = target_id then p.avatar_url
      when s.avatar_visibility = 'everyone' then p.avatar_url
      when s.avatar_visibility = 'participants' and is_participant then p.avatar_url
      else null
    end,
    case
      when viewer = target_id then p.email
      when s.email_visibility = 'participants' and is_participant then p.email
      else null
    end,
    case
      when viewer = target_id then p.phone_number
      when s.phone_visibility = 'participants' and is_participant then p.phone_number
      else null
    end;
end;
$$;

revoke all on function public.get_profile_visible(uuid) from public;
grant execute on function public.get_profile_visible(uuid) to authenticated;
create or replace function public.update_username(p_new_username text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_username text;
  v_count smallint;
  v_is_first_pick boolean;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  p_new_username := lower(trim(p_new_username));

  if p_new_username !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'username must be 3-20 characters and contain only lowercase letters, numbers, and underscores';
  end if;

  select username, username_changed_count
    into v_current_username, v_count
  from public.profiles
  where id = auth.uid()
  for update;

  if v_current_username is null then
    raise exception 'profile not found';
  end if;

  if v_current_username = p_new_username then
    return;
  end if;

  v_is_first_pick := v_current_username ~ '^user_[0-9a-f]{8}$';

  if not v_is_first_pick and v_count >= 1 then
    raise exception 'username can only be changed once';
  end if;

  update public.profiles
  set username = p_new_username,
      username_changed_count = case
        when v_is_first_pick then username_changed_count
        else username_changed_count + 1
      end,
      updated_at = now()
  where id = auth.uid();
end;
$$;

revoke all on function public.update_username(text) from public;
grant execute on function public.update_username(text) to authenticated;
create or replace function public.search_users(p_query text, p_limit integer default 10)
returns table (
  id uuid,
  username text,
  full_name text
)
language sql
security invoker
stable
set search_path = public
as $$
  select profiles.id, profiles.username, profiles.full_name
  from public.profiles
  where auth.uid() is not null
    and profiles.id <> auth.uid()
    and (
      profiles.username_normalized ilike lower(trim(p_query)) || '%'
      or profiles.full_name ilike '%' || trim(p_query) || '%'
    )
  order by
    case when profiles.username_normalized = lower(trim(p_query)) then 0 else 1 end,
    profiles.username_normalized
  limit least(greatest(coalesce(p_limit, 10), 1), 20);
$$;

revoke all on function public.search_users(text, integer) from public;
grant execute on function public.search_users(text, integer) to authenticated;
-- accept_offer(offer_id): atomically accept an active offer, creating the loan.
-- SECURITY DEFINER because clients have no INSERT/UPDATE grant on loans/loan_offers.
-- `select ... for update` on the parent request row serializes concurrent
-- acceptance attempts; the UNIQUE(request_id)/UNIQUE(accepted_offer_id)
-- constraints on `loans` are the final backstop against a race.

create or replace function public.accept_offer(p_offer_id uuid)
returns uuid
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
$$;

revoke all on function public.accept_offer(uuid) from public;
grant execute on function public.accept_offer(uuid) to authenticated;
-- Interest engine (PL/pgSQL, authoritative twin of lib/interest/engine.ts).
-- Calendar-accurate period walk (not nominal 30/365 day-count) per the
-- master spec's rate semantics: interest_rate is a per-`interest_frequency`
-- rate, and monthly/yearly periods are measured from the anchor date using
-- real calendar month/year boundaries, with the leftover days measured
-- against the length of the *next* (partial) period.

create or replace function public.calendar_periods_elapsed(
  p_freq public.interest_frequency,
  p_anchor date,
  p_as_of date,
  out full_periods integer,
  out remainder_days integer,
  out period_len_days integer
)
language plpgsql
immutable
as $$
declare
  v_cursor date := p_anchor;
  v_next date;
begin
  full_periods := 0;

  if p_as_of <= p_anchor then
    remainder_days := 0;
    v_next := case p_freq
      when 'daily' then p_anchor + 1
      when 'monthly' then (p_anchor + interval '1 month')::date
      when 'yearly' then (p_anchor + interval '1 year')::date
    end;
    period_len_days := v_next - p_anchor;
    return;
  end if;

  if p_freq = 'daily' then
    full_periods := p_as_of - p_anchor;
    remainder_days := 0;
    period_len_days := 1;
    return;
  end if;

  loop
    v_next := case p_freq
      when 'monthly' then (v_cursor + interval '1 month')::date
      when 'yearly' then (v_cursor + interval '1 year')::date
    end;
    exit when v_next > p_as_of;
    v_cursor := v_next;
    full_periods := full_periods + 1;
  end loop;

  remainder_days := p_as_of - v_cursor;
  period_len_days := v_next - v_cursor;
end;
$$;

create or replace function public.accrue_simple_interest(
  p_principal numeric,
  p_rate numeric,
  p_freq public.interest_frequency,
  p_anchor date,
  p_as_of date
)
returns numeric
language plpgsql
immutable
as $$
declare
  v_full_periods integer;
  v_remainder_days integer;
  v_period_len_days integer;
  v_periods_elapsed numeric;
begin
  if p_rate is null or p_as_of <= p_anchor or p_principal <= 0 then
    return 0;
  end if;

  select f.full_periods, f.remainder_days, f.period_len_days
    into v_full_periods, v_remainder_days, v_period_len_days
  from public.calendar_periods_elapsed(p_freq, p_anchor, p_as_of) f;

  v_periods_elapsed := v_full_periods + (v_remainder_days::numeric / greatest(v_period_len_days, 1));

  return round(p_principal * (p_rate / 100) * v_periods_elapsed, 2);
end;
$$;

create or replace function public.accrue_compound_interest(
  p_principal numeric,
  p_rate numeric,
  p_freq public.interest_frequency,
  p_compounding public.interest_frequency,
  p_anchor date,
  p_as_of date
)
returns numeric
language plpgsql
immutable
as $$
declare
  v_nominal_days_freq numeric;
  v_nominal_days_comp numeric;
  v_period_rate numeric;
  v_full_periods integer;
  v_remainder_days integer;
  v_period_len_days integer;
  v_compounded numeric;
  v_partial numeric;
begin
  if p_rate is null or p_as_of <= p_anchor or p_principal <= 0 then
    return 0;
  end if;

  v_nominal_days_freq := case p_freq when 'daily' then 1 when 'monthly' then 365.2425 / 12 else 365.2425 end;
  v_nominal_days_comp := case p_compounding when 'daily' then 1 when 'monthly' then 365.2425 / 12 else 365.2425 end;
  v_period_rate := (p_rate * (v_nominal_days_comp / v_nominal_days_freq)) / 100;

  select f.full_periods, f.remainder_days, f.period_len_days
    into v_full_periods, v_remainder_days, v_period_len_days
  from public.calendar_periods_elapsed(p_compounding, p_anchor, p_as_of) f;

  v_compounded := p_principal * power((1 + v_period_rate)::numeric, v_full_periods);
  v_partial := v_compounded * v_period_rate * (v_remainder_days::numeric / greatest(v_period_len_days, 1));

  return round((v_compounded + v_partial) - p_principal, 2);
end;
$$;

create or replace function public.accrue_interest(
  p_interest_type public.interest_type,
  p_rate numeric,
  p_freq public.interest_frequency,
  p_compounding public.interest_frequency,
  p_principal numeric,
  p_anchor date,
  p_as_of date
)
returns numeric
language plpgsql
immutable
as $$
begin
  if p_interest_type = 'none' or p_as_of <= p_anchor or p_principal <= 0 then
    return 0;
  elsif p_interest_type = 'simple' then
    return public.accrue_simple_interest(p_principal, p_rate, p_freq, p_anchor, p_as_of);
  else
    return public.accrue_compound_interest(p_principal, p_rate, p_freq, p_compounding, p_anchor, p_as_of);
  end if;
end;
$$;

-- compute_loan_ledger: the authoritative event-driven ledger walk (spec §1.6).
-- Internal building block only — no EXECUTE grant to `authenticated`.
-- Walks payments chronologically, applying interest-first allocation, and
-- freezes accrual at `paid_off_date` if the loan has already closed.
create or replace function public.compute_loan_ledger(
  p_loan_id uuid,
  p_as_of date,
  out outstanding numeric,
  out principal_remaining numeric,
  out unpaid_interest numeric
)
language plpgsql
set search_path = public
as $$
declare
  v_loan public.loans%rowtype;
  v_effective_as_of date;
  v_anchor date;
  v_principal numeric;
  v_unpaid_interest numeric := 0;
  v_payment record;
  v_segment_interest numeric;
  v_interest_portion numeric;
  v_principal_portion numeric;
begin
  select * into v_loan from public.loans where id = p_loan_id;
  if v_loan.id is null then
    raise exception 'loan not found';
  end if;

  v_effective_as_of := p_as_of;
  if v_loan.paid_off_date is not null and v_effective_as_of > v_loan.paid_off_date then
    v_effective_as_of := v_loan.paid_off_date;
  end if;

  v_principal := v_loan.principal_amount;
  v_anchor := v_loan.start_date;

  for v_payment in
    select * from public.payments
    where loan_id = p_loan_id and payment_date <= v_effective_as_of
    order by payment_date asc, created_at asc
  loop
    v_segment_interest := public.accrue_interest(
      v_loan.interest_type, v_loan.interest_rate, v_loan.interest_frequency,
      v_loan.compounding, v_principal, v_anchor, v_payment.payment_date
    );
    v_unpaid_interest := v_unpaid_interest + v_segment_interest;

    v_interest_portion := least(v_payment.amount, v_unpaid_interest);
    v_principal_portion := least(v_payment.amount - v_interest_portion, v_principal);

    v_unpaid_interest := v_unpaid_interest - v_interest_portion;
    v_principal := v_principal - v_principal_portion;
    v_anchor := v_payment.payment_date;
  end loop;

  v_unpaid_interest := v_unpaid_interest + public.accrue_interest(
    v_loan.interest_type, v_loan.interest_rate, v_loan.interest_frequency,
    v_loan.compounding, v_principal, v_anchor, v_effective_as_of
  );

  outstanding := v_principal + v_unpaid_interest;
  principal_remaining := v_principal;
  unpaid_interest := v_unpaid_interest;
end;
$$;

revoke all on function public.compute_loan_ledger(uuid, date) from public;

-- get_loan_ledger: read-only, participant-gated wrapper for display.
-- Backs the loan-detail page and dashboard aggregates. Historical payment
-- rows (interest_component/principal_component/overpaid_excess) are read
-- directly from `payments` by the client via RLS — they're frozen at
-- insert time by record_payment and never recomputed here.
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
  v_has_payments boolean;
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
  select exists(select 1 from public.payments where loan_id = p_loan_id) into v_has_payments;

  outstanding := v_ledger.outstanding;
  principal_remaining := v_ledger.principal_remaining;
  unpaid_interest := v_ledger.unpaid_interest;
  is_overdue := (v_loan.status = 'ACTIVE') and (current_date > v_loan.due_date) and (v_ledger.outstanding > 0);
  is_partially_paid := v_has_payments and v_ledger.outstanding > 0;
  status := v_loan.status;
  return next;
end;
$$;

revoke all on function public.get_loan_ledger(uuid) from public;
grant execute on function public.get_loan_ledger(uuid) to authenticated;
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
create trigger loan_offers_notify_counter
  after insert on public.loan_offers
  for each row execute function public.notify_counter_offer();
-- update_profile_details(full_name, phone_number): the profiles table
-- deliberately has no direct client UPDATE grant (0008) — email/avatar_url
-- come from Google OAuth at signup via handle_new_user() and shouldn't be
-- client-writable. But full_name and phone_number have no such source of
-- truth after signup, and phone_number has a dedicated privacy-visibility
-- setting with no way to ever populate the field it controls. This RPC is
-- the (previously missing) write path for exactly those two columns.

create or replace function public.update_profile_details(
  p_full_name text default null,
  p_phone_number text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_phone text;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  v_full_name := nullif(trim(p_full_name), '');
  v_phone := nullif(trim(p_phone_number), '');

  if v_full_name is not null and length(v_full_name) > 100 then
    raise exception 'full name is too long';
  end if;

  if v_phone is not null and v_phone !~ '^[0-9+()\-\s]{6,20}$' then
    raise exception 'invalid phone number format';
  end if;

  update public.profiles
  set full_name = v_full_name,
      phone_number = v_phone,
      updated_at = now()
  where id = auth.uid();
end;
$$;

revoke all on function public.update_profile_details(text, text) from public;
grant execute on function public.update_profile_details(text, text) to authenticated;
-- send_deadline_reminders(): scans all ACTIVE loans and emits at most one
-- 'deadline_reminder' (3 days out) and one 'overdue' notification per loan,
-- ever — de-duplicated by checking notifications already on record rather
-- than by a separate "reminded" flag, so it's safe to run this as often as
-- you like (idempotent no-op on every call after the first that matches).
--
-- Intended to be invoked daily by pg_cron (see README "Supabase Setup" for
-- the exact manual dashboard step — pg_cron must be enabled per-project
-- before cron.schedule() is callable, so it isn't wired up automatically
-- here). Can equally be called from an external scheduler (e.g. a Vercel
-- Cron Job hitting a route handler that does `select
-- send_deadline_reminders()`) if pg_cron isn't available on your plan.

create or replace function public.send_deadline_reminders()
returns table (reminders_sent integer, overdue_sent integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan record;
  v_ledger record;
  v_reminders integer := 0;
  v_overdue integer := 0;
  v_already_reminded boolean;
  v_already_overdue boolean;
begin
  for v_loan in
    select * from public.loans
    where status = 'ACTIVE'
      and due_date >= current_date - interval '365 days' -- bound the scan; ancient overdue loans still get exactly one overdue notice from the day they crossed 365d back if this job has been running
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

    -- overdue, not yet flagged
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
$$;

-- No grant to `authenticated` — this is an internal job function, invoked
-- only by the cron scheduler (running as the function owner) or manually
-- by a service-role/admin context. Client code must never call this.
revoke all on function public.send_deadline_reminders() from public, authenticated;

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
do $$ begin
  drop function if exists public.get_loan_ledger(uuid) cascade;
  drop function if exists public.compute_loan_ledger(uuid, date) cascade;
  drop function if exists public.compute_loan_ledger cascade;
exception when others then null; end $$;

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

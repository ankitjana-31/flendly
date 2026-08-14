create or replace function public.nominal_days(freq public.interest_frequency)
returns numeric language sql immutable as $$
  select case freq
    when 'daily' then 1.0
    when 'monthly' then 365.2425 / 12.0
    when 'yearly' then 365.2425
  end;
$$;

create or replace function public.compound_period_rate(rate numeric, freq public.interest_frequency, compounding public.interest_frequency)
returns numeric language sql immutable as $$
  select rate * (public.nominal_days(compounding) / public.nominal_days(freq));
$$;

create or replace function public.accrue_interest(
  principal numeric,
  interest_type public.interest_type,
  rate numeric,
  freq public.interest_frequency,
  compounding public.interest_frequency,
  anchor_date date,
  as_of date
) returns numeric
language plpgsql
stable
set search_path = public
as $$
declare
  v_r numeric;
  v_full_periods integer := 0;
  v_remainder_days integer;
  v_period_len_days integer;
  v_temp_date date := anchor_date;
  v_next_date date;
  v_compounded_principal numeric;
  v_partial numeric;
  v_periods_elapsed numeric;
begin
  if interest_type = 'none' or rate is null or freq is null or anchor_date >= as_of then
    return 0.00;
  end if;

  if interest_type = 'simple' then
    loop
      if freq = 'daily' then
        v_next_date := v_temp_date + 1;
      elsif freq = 'monthly' then
        v_next_date := (v_temp_date + interval '1 month')::date;
      elsif freq = 'yearly' then
        v_next_date := (v_temp_date + interval '1 year')::date;
      end if;

      if v_next_date <= as_of then
        v_full_periods := v_full_periods + 1;
        v_temp_date := v_next_date;
      else
        exit;
      end if;
    end loop;

    v_remainder_days := as_of - v_temp_date;

    if freq = 'daily' then
      v_period_len_days := 1;
    elsif freq = 'monthly' then
      v_period_len_days := (v_temp_date + interval '1 month')::date - v_temp_date;
    elsif freq = 'yearly' then
      v_period_len_days := (v_temp_date + interval '1 year')::date - v_temp_date;
    end if;

    v_periods_elapsed := v_full_periods::numeric + (v_remainder_days::numeric / v_period_len_days::numeric);
    return round(principal * (rate / 100.0) * v_periods_elapsed, 2);

  elsif interest_type = 'compound' then
    v_r := public.compound_period_rate(rate, freq, compounding) / 100.0;
    
    loop
      if compounding = 'daily' then
        v_next_date := v_temp_date + 1;
      elsif compounding = 'monthly' then
        v_next_date := (v_temp_date + interval '1 month')::date;
      elsif compounding = 'yearly' then
        v_next_date := (v_temp_date + interval '1 year')::date;
      end if;

      if v_next_date <= as_of then
        v_full_periods := v_full_periods + 1;
        v_temp_date := v_next_date;
      else
        exit;
      end if;
    end loop;

    v_remainder_days := as_of - v_temp_date;

    if compounding = 'daily' then
      v_period_len_days := 1;
    elsif compounding = 'monthly' then
      v_period_len_days := (v_temp_date + interval '1 month')::date - v_temp_date;
    elsif compounding = 'yearly' then
      v_period_len_days := (v_temp_date + interval '1 year')::date - v_temp_date;
    end if;

    v_compounded_principal := principal * power(1.0 + v_r, v_full_periods);
    v_partial := v_compounded_principal * v_r * (v_remainder_days::numeric / v_period_len_days::numeric);
    return round((v_compounded_principal + v_partial) - principal, 2);
  else
    return 0.00;
  end if;
end;
$$;

create or replace function public.compute_loan_ledger(p_loan_id uuid, p_as_of date)
returns table (
  outstanding numeric(14,2),
  principal numeric(14,2),
  unpaid_interest numeric(14,2)
)
language plpgsql
stable
set search_path = public
as $$
declare
  v_loan public.loans%rowtype;
  v_p record;
  v_principal numeric := 0;
  v_unpaid_interest numeric := 0;
  v_anchor_date date;
  v_segment_interest numeric;
  v_calc_date date := p_as_of;
begin
  select * into v_loan from public.loans where id = p_loan_id;
  if v_loan.id is null then
    return query select 0.00::numeric, 0.00::numeric, 0.00::numeric;
    return;
  end if;

  -- Freezes accrual at paid_off_date if already PAID
  if v_loan.status = 'PAID' and v_loan.paid_off_date is not null then
    v_calc_date := least(p_as_of, v_loan.paid_off_date);
  end if;

  v_principal := v_loan.principal_amount;
  v_anchor_date := v_loan.start_date;

  for v_p in (
    select * from public.payments
    where loan_id = p_loan_id and payment_date <= v_calc_date
    order by payment_date asc, created_at asc
  ) loop
    v_segment_interest := public.accrue_interest(
      v_principal,
      v_loan.interest_type,
      v_loan.interest_rate,
      v_loan.interest_frequency,
      v_loan.compounding,
      v_anchor_date,
      v_p.payment_date
    );
    v_unpaid_interest := v_unpaid_interest + v_segment_interest;

    -- Apply payment components
    v_unpaid_interest := v_unpaid_interest - v_p.interest_component;
    v_principal := v_principal - v_p.principal_component;
    v_anchor_date := v_p.payment_date;
  end loop;

  v_segment_interest := public.accrue_interest(
    v_principal,
    v_loan.interest_type,
    v_loan.interest_rate,
    v_loan.interest_frequency,
    v_loan.compounding,
    v_anchor_date,
    v_calc_date
  );
  v_unpaid_interest := v_unpaid_interest + v_segment_interest;

  return query select
    round(v_principal + v_unpaid_interest, 2),
    round(v_principal, 2),
    round(v_unpaid_interest, 2);
end;
$$;

create or replace function public.get_loan_ledger(p_loan_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_viewer uuid := auth.uid();
  v_loan public.loans%rowtype;
  v_outstanding numeric;
  v_principal numeric;
  v_unpaid_interest numeric;
  v_payments jsonb;
begin
  if v_viewer is null then
    raise exception 'authentication required';
  end if;

  select * into v_loan from public.loans where id = p_loan_id;
  if v_loan.id is null then
    raise exception 'loan not found';
  end if;

  if v_viewer <> v_loan.lender_id and v_viewer <> v_loan.borrower_id then
    raise exception 'not authorized';
  end if;

  select compute.outstanding, compute.principal, compute.unpaid_interest
    into v_outstanding, v_principal, v_unpaid_interest
    from public.compute_loan_ledger(p_loan_id, current_date) compute;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'payer_id', payer_id,
    'receiver_id', receiver_id,
    'amount', amount,
    'interest_component', interest_component,
    'principal_component', principal_component,
    'overpaid_excess', overpaid_excess,
    'payment_date', payment_date,
    'note', note,
    'created_at', created_at
  ) order by payment_date asc, created_at asc), '[]'::jsonb) into v_payments
  from public.payments
  where loan_id = p_loan_id;

  return jsonb_build_object(
    'loan_id', p_loan_id,
    'status', v_loan.status,
    'principal_amount', v_loan.principal_amount,
    'interest_type', v_loan.interest_type,
    'interest_rate', v_loan.interest_rate,
    'interest_frequency', v_loan.interest_frequency,
    'compounding', v_loan.compounding,
    'start_date', v_loan.start_date,
    'due_date', v_loan.due_date,
    'lender_id', v_loan.lender_id,
    'borrower_id', v_loan.borrower_id,
    'outstanding', v_outstanding,
    'principal', v_principal,
    'unpaid_interest', v_unpaid_interest,
    'payments', v_payments
  );
end;
$$;

revoke all on function public.get_loan_ledger(uuid) from public;
grant execute on function public.get_loan_ledger(uuid) to authenticated;

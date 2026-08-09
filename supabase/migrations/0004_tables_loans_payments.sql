create table public.loans (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.loan_requests(id),
  accepted_offer_id uuid not null unique references public.loan_offers(id),
  lender_id uuid not null references public.profiles(id),
  borrower_id uuid not null references public.profiles(id),
  principal_amount numeric(14,2) not null check (principal_amount > 0),
  interest_type public.interest_type not null,
  interest_rate numeric(6,3),
  interest_frequency public.interest_frequency,
  compounding public.interest_frequency,
  start_date date not null,
  due_date date not null,
  status public.loan_status not null default 'ACTIVE',
  paid_off_date date,
  reminder_3day_sent_at timestamptz,
  reminder_due_sent_at timestamptz,
  reminder_overdue_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lender_ne_borrower check (lender_id <> borrower_id),
  constraint loan_interest_terms_match_type check (
    (interest_type = 'none' and interest_rate is null and interest_frequency is null and compounding is null) or
    (interest_type = 'simple' and interest_rate is not null and interest_rate >= 0 and interest_frequency is not null and compounding is null) or
    (interest_type = 'compound' and interest_rate is not null and interest_rate >= 0 and interest_frequency is not null and compounding is not null)
  ),
  constraint paid_off_date_requires_paid check (
    (status = 'PAID' and paid_off_date is not null) or
    (status = 'ACTIVE' and paid_off_date is null)
  )
);

create index loans_lender_status_idx
  on public.loans (lender_id, status);

create index loans_borrower_status_idx
  on public.loans (borrower_id, status);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id),
  payer_id uuid not null references public.profiles(id),
  receiver_id uuid not null references public.profiles(id),
  amount numeric(14,2) not null check (amount > 0),
  interest_component numeric(14,2) not null check (interest_component >= 0),
  principal_component numeric(14,2) not null check (principal_component >= 0),
  overpaid_excess numeric(14,2) not null default 0 check (overpaid_excess >= 0),
  payment_date date not null,
  note text,
  created_at timestamptz not null default now(),
  constraint payments_allocation_sums_to_amount
    check (interest_component + principal_component + overpaid_excess = amount),
  constraint payment_not_future check (payment_date <= now()::date)
);

create index payments_loan_idx
  on public.payments (loan_id, payment_date, created_at);

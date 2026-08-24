create table public.loan_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id),
  receiver_id uuid not null references public.profiles(id),
  direction public.request_direction not null,
  status public.request_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_self_request check (sender_id <> receiver_id)
);

create index loan_requests_sender_status_idx
  on public.loan_requests (sender_id, status);

create index loan_requests_receiver_status_idx
  on public.loan_requests (receiver_id, status);

create table public.loan_offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.loan_requests(id),
  created_by uuid not null references public.profiles(id),
  amount numeric(14,2) not null check (amount > 0),
  interest_type public.interest_type not null,
  interest_rate numeric(6,3) check (
    (interest_type = 'none' and interest_rate is null) or
    (interest_type <> 'none' and interest_rate is not null and interest_rate >= 0)
  ),
  interest_frequency public.interest_frequency check (
    (interest_type = 'none' and interest_frequency is null) or
    (interest_type <> 'none' and interest_frequency is not null)
  ),
  compounding public.interest_frequency check (
    (interest_type = 'compound' and compounding is not null) or
    (interest_type <> 'compound' and compounding is null)
  ),
  deadline date not null,
  message text,
  status public.offer_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  constraint deadline_in_future_at_creation check (deadline > created_at::date)
);

create unique index loan_offers_one_active_per_request
  on public.loan_offers (request_id)
  where status = 'ACTIVE';

create index loan_offers_request_idx
  on public.loan_offers (request_id);

create or replace function public.handle_active_offer_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_previous_active uuid;
begin
  if new.status <> 'ACTIVE' then
    return new;
  end if;

  select id into v_previous_active
  from public.loan_offers
  where request_id = new.request_id
    and status = 'ACTIVE'
  order by created_at desc
  limit 1
  for update;

  if v_previous_active is not null then
    update public.loan_offers
    set status = 'SUPERSEDED'
    where id = v_previous_active;

    update public.loan_requests
    set status = 'COUNTERED',
        updated_at = now()
    where id = new.request_id
      and status in ('PENDING', 'COUNTERED');
  end if;

  return new;
end;
$$;

drop trigger if exists loan_offers_supersede_active on public.loan_offers;
create trigger loan_offers_supersede_active
  before insert on public.loan_offers
  for each row execute function public.handle_active_offer_insert();

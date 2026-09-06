-- 0022_self_track_feature.sql
-- Self Track: Personal financial tracking separate from official Flendly loans

-- Create enum for self track type
do $$ begin
  create type public.self_track_type as enum ('lent', 'borrowed');
exception when duplicate_object then null; end $$;

-- Create enum for self track status
do $$ begin
  create type public.self_track_status as enum ('active', 'settled');
exception when duplicate_object then null; end $$;

-- Create self_track table
create table if not exists public.self_track (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.self_track_type not null,
  person_name text not null,
  amount numeric not null,
  record_date date not null,
  note text,
  status public.self_track_status not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create self_track_payments table for tracking repayments
create table if not exists public.self_track_payments (
  id uuid primary key default gen_random_uuid(),
  self_track_id uuid not null references public.self_track(id) on delete cascade,
  amount numeric not null,
  payment_date date not null,
  note text,
  created_at timestamp with time zone default now()
);

-- Create index for fast lookups
create index if not exists idx_self_track_user_id on public.self_track(user_id);
create index if not exists idx_self_track_status on public.self_track(status);
create index if not exists idx_self_track_payments_track_id on public.self_track_payments(self_track_id);

-- RLS: Enable RLS on both tables
alter table public.self_track enable row level security;
alter table public.self_track_payments enable row level security;

-- RLS Policies for self_track table
-- Users can only see their own records
create policy "users_can_read_own_self_track" on public.self_track
  for select using (auth.uid() = user_id);

-- Users can only insert their own records
create policy "users_can_insert_own_self_track" on public.self_track
  for insert with check (auth.uid() = user_id);

-- Users can only update their own records
create policy "users_can_update_own_self_track" on public.self_track
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Users can only delete their own records
create policy "users_can_delete_own_self_track" on public.self_track
  for delete using (auth.uid() = user_id);

-- RLS Policies for self_track_payments table
-- Users can only see payments for their own self_track records
create policy "users_can_read_own_self_track_payments" on public.self_track_payments
  for select using (
    exists (
      select 1 from public.self_track
      where public.self_track.id = self_track_payments.self_track_id
        and public.self_track.user_id = auth.uid()
    )
  );

-- Users can only insert payments for their own self_track records
create policy "users_can_insert_own_self_track_payments" on public.self_track_payments
  for insert with check (
    exists (
      select 1 from public.self_track
      where public.self_track.id = self_track_id
        and public.self_track.user_id = auth.uid()
    )
  );

-- Users can only delete payments for their own self_track records
create policy "users_can_delete_own_self_track_payments" on public.self_track_payments
  for delete using (
    exists (
      select 1 from public.self_track
      where public.self_track.id = self_track_id
        and public.self_track.user_id = auth.uid()
    )
  );

-- Grant permissions
grant all on public.self_track to authenticated;
grant all on public.self_track_payments to authenticated;

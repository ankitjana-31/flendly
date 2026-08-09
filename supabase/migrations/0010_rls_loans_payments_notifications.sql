alter table public.loans enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

grant select on public.loans to authenticated;
grant select on public.payments to authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy loans_select_participant
  on public.loans
  for select
  to authenticated
  using (auth.uid() in (lender_id, borrower_id));

create policy payments_select_participant
  on public.payments
  for select
  to authenticated
  using (auth.uid() in (payer_id, receiver_id));

create policy notifications_select_own
  on public.notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy notifications_mark_read_own
  on public.notifications
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

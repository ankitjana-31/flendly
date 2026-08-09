alter table public.loan_requests enable row level security;
alter table public.loan_offers enable row level security;

grant select, insert on public.loan_requests to authenticated;
grant select, insert on public.loan_offers to authenticated;

create policy loan_requests_select_participant
  on public.loan_requests
  for select
  to authenticated
  using (auth.uid() in (sender_id, receiver_id));

create policy loan_requests_insert_sender
  on public.loan_requests
  for insert
  to authenticated
  with check (auth.uid() = sender_id and sender_id <> receiver_id);

create policy loan_offers_select_participant
  on public.loan_offers
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.loan_requests
      where loan_requests.id = loan_offers.request_id
        and auth.uid() in (loan_requests.sender_id, loan_requests.receiver_id)
    )
  );

create policy loan_offers_insert_participant_on_open_request
  on public.loan_offers
  for insert
  to authenticated
  with check (
    auth.uid() = created_by
    and exists (
      select 1
      from public.loan_requests
      where loan_requests.id = loan_offers.request_id
        and auth.uid() in (loan_requests.sender_id, loan_requests.receiver_id)
        and loan_requests.status in ('PENDING', 'COUNTERED')
    )
  );

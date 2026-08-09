create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger privacy_settings_set_updated_at
  before update on public.privacy_settings
  for each row execute function public.set_updated_at();

create trigger loan_requests_set_updated_at
  before update on public.loan_requests
  for each row execute function public.set_updated_at();

create trigger loans_set_updated_at
  before update on public.loans
  for each row execute function public.set_updated_at();

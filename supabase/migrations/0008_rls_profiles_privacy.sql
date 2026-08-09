alter table public.profiles enable row level security;
alter table public.privacy_settings enable row level security;

grant usage on schema public to authenticated;
grant select (
  id,
  username,
  username_normalized,
  username_changed_count,
  full_name,
  created_at,
  updated_at
) on public.profiles to authenticated;
grant select on public.privacy_settings to authenticated;
grant update (
  avatar_visibility,
  email_visibility,
  phone_visibility
) on public.privacy_settings to authenticated;

create policy profiles_select_authenticated
  on public.profiles
  for select
  to authenticated
  using (true);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy privacy_settings_select_own
  on public.privacy_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy privacy_settings_update_own
  on public.privacy_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

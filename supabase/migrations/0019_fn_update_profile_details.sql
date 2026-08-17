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

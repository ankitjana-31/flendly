create or replace function public.update_username(p_new_username text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_username text;
  v_count smallint;
  v_is_first_pick boolean;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  p_new_username := lower(trim(p_new_username));

  if p_new_username !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'username must be 3-20 characters and contain only lowercase letters, numbers, and underscores';
  end if;

  select username, username_changed_count
    into v_current_username, v_count
  from public.profiles
  where id = auth.uid()
  for update;

  if v_current_username is null then
    raise exception 'profile not found';
  end if;

  if v_current_username = p_new_username then
    return;
  end if;

  v_is_first_pick := v_current_username ~ '^user_[0-9a-f]{8}$';

  if not v_is_first_pick and v_count >= 1 then
    raise exception 'username can only be changed once';
  end if;

  update public.profiles
  set username = p_new_username,
      username_changed_count = case
        when v_is_first_pick then username_changed_count
        else username_changed_count + 1
      end,
      updated_at = now()
  where id = auth.uid();
end;
$$;

revoke all on function public.update_username(text) from public;
grant execute on function public.update_username(text) to authenticated;

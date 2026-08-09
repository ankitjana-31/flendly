create or replace function public.search_users(p_query text, p_limit integer default 10)
returns table (
  id uuid,
  username text,
  full_name text
)
language sql
security invoker
stable
set search_path = public
as $$
  select profiles.id, profiles.username, profiles.full_name
  from public.profiles
  where auth.uid() is not null
    and profiles.id <> auth.uid()
    and (
      profiles.username_normalized ilike lower(trim(p_query)) || '%'
      or profiles.full_name ilike '%' || trim(p_query) || '%'
    )
  order by
    case when profiles.username_normalized = lower(trim(p_query)) then 0 else 1 end,
    profiles.username_normalized
  limit least(greatest(coalesce(p_limit, 10), 1), 20);
$$;

revoke all on function public.search_users(text, integer) from public;
grant execute on function public.search_users(text, integer) to authenticated;

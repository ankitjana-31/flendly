create or replace function public.get_profile_visible(target_id uuid)
returns table (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  email text,
  phone_number text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer uuid := auth.uid();
  is_participant boolean := false;
  p public.profiles%rowtype;
  s public.privacy_settings%rowtype;
begin
  if viewer is null then
    raise exception 'authentication required';
  end if;

  select * into p
  from public.profiles
  where profiles.id = target_id;

  if p.id is null then
    return;
  end if;

  select * into s
  from public.privacy_settings
  where privacy_settings.user_id = target_id;

  is_participant := (viewer = target_id) or exists (
    select 1
    from public.loan_requests
    where (sender_id = viewer and receiver_id = target_id)
       or (sender_id = target_id and receiver_id = viewer)
    union
    select 1
    from public.loans
    where (lender_id = viewer and borrower_id = target_id)
       or (lender_id = target_id and borrower_id = viewer)
  );

  return query select
    p.id,
    p.username,
    p.full_name,
    case
      when viewer = target_id then p.avatar_url
      when s.avatar_visibility = 'everyone' then p.avatar_url
      when s.avatar_visibility = 'participants' and is_participant then p.avatar_url
      else null
    end,
    case
      when viewer = target_id then p.email
      when s.email_visibility = 'participants' and is_participant then p.email
      else null
    end,
    case
      when viewer = target_id then p.phone_number
      when s.phone_visibility = 'participants' and is_participant then p.phone_number
      else null
    end;
end;
$$;

revoke all on function public.get_profile_visible(uuid) from public;
grant execute on function public.get_profile_visible(uuid) to authenticated;

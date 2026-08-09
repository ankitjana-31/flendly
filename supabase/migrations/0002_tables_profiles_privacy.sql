create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  username_normalized text generated always as (lower(username)) stored,
  username_changed_count smallint not null default 0
    check (username_changed_count >= 0 and username_changed_count <= 1),
  full_name text,
  email text not null,
  avatar_url text,
  phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

create unique index profiles_username_normalized_key
  on public.profiles (username_normalized);

create table public.privacy_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  avatar_visibility public.visibility_level not null default 'participants',
  email_visibility public.visibility_level_restricted not null default 'only_me',
  phone_visibility public.visibility_level_restricted not null default 'only_me',
  updated_at timestamptz not null default now()
);

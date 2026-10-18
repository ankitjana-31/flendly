-- 0027_fix_realtime_tables.sql
-- Fix table name self_track (was mistyped as self_tracks in 0026) and ensure all core tables
-- (notifications, loans, payments, loan_requests, loan_offers, self_track, self_track_payments)
-- are in supabase_realtime publication with full replica identity for instant updates.

do $$
declare
  t text;
  tables text[] := array['notifications', 'loans', 'payments', 'loan_requests', 'loan_offers', 'self_track', 'self_track_payments'];
begin
  foreach t in array tables loop
    if exists (
      select 1 from pg_tables where schemaname = 'public' and tablename = t
    ) then
      if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I;', t);
      end if;
      execute format('alter table public.%I replica identity full;', t);
    end if;
  end loop;
end $$;

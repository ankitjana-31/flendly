-- 0026_enable_realtime_all_tables.sql
-- Enable Supabase Realtime publication on loans, payments, loan_requests, loan_offers, and self_tracks
-- to ensure live sync across Lent, Borrowed, Dashboard, and Requests.

do $$
declare
  t text;
  tables text[] := array['loans', 'payments', 'loan_requests', 'loan_offers', 'self_tracks'];
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

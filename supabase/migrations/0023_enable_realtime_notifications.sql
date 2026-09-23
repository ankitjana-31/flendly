-- 0023_enable_realtime_notifications.sql
-- Enable Supabase Realtime publication on public.notifications
-- and set REPLICA IDENTITY FULL so postgres_changes receives complete old/new payloads

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

alter table public.notifications replica identity full;

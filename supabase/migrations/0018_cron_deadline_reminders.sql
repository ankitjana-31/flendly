create extension if not exists pg_cron;

create or replace function public.dispatch_deadline_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 3-day-before reminder
  insert into public.notifications (user_id, type, payload)
    select borrower_id, 'deadline_reminder', jsonb_build_object('loan_id', id)
    from public.loans
    where status = 'ACTIVE'
      and due_date = current_date + 3
      and reminder_3day_sent_at is null;
  update public.loans set reminder_3day_sent_at = now()
    where status = 'ACTIVE' and due_date = current_date + 3 and reminder_3day_sent_at is null;

  -- due-date reminder
  insert into public.notifications (user_id, type, payload)
    select borrower_id, 'deadline_reminder', jsonb_build_object('loan_id', id)
    from public.loans
    where status = 'ACTIVE' and due_date = current_date and reminder_due_sent_at is null;
  update public.loans set reminder_due_sent_at = now()
    where status = 'ACTIVE' and due_date = current_date and reminder_due_sent_at is null;

  -- first-time overdue notice (fires once, ever, per loan)
  insert into public.notifications (user_id, type, payload)
    select borrower_id, 'overdue', jsonb_build_object('loan_id', id)
    from public.loans
    where status = 'ACTIVE' and due_date < current_date and reminder_overdue_sent_at is null;
  update public.loans set reminder_overdue_sent_at = now()
    where status = 'ACTIVE' and due_date < current_date and reminder_overdue_sent_at is null;
end;
$$;

-- Schedule once daily at 3:00 AM UTC
select cron.schedule('deadline-reminders-daily', '0 3 * * *', $$select public.dispatch_deadline_reminders()$$);

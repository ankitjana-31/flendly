-- send_deadline_reminders(): scans all ACTIVE loans and emits at most one
-- 'deadline_reminder' (3 days out) and one 'overdue' notification per loan,
-- ever — de-duplicated by checking notifications already on record rather
-- than by a separate "reminded" flag, so it's safe to run this as often as
-- you like (idempotent no-op on every call after the first that matches).
--
-- Intended to be invoked daily by pg_cron (see README "Supabase Setup" for
-- the exact manual dashboard step — pg_cron must be enabled per-project
-- before cron.schedule() is callable, so it isn't wired up automatically
-- here). Can equally be called from an external scheduler (e.g. a Vercel
-- Cron Job hitting a route handler that does `select
-- send_deadline_reminders()`) if pg_cron isn't available on your plan.

create or replace function public.send_deadline_reminders()
returns table (reminders_sent integer, overdue_sent integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan record;
  v_ledger record;
  v_reminders integer := 0;
  v_overdue integer := 0;
  v_already_reminded boolean;
  v_already_overdue boolean;
begin
  for v_loan in
    select * from public.loans
    where status = 'ACTIVE'
      and due_date >= current_date - interval '365 days' -- bound the scan; ancient overdue loans still get exactly one overdue notice from the day they crossed 365d back if this job has been running
  loop
    select * into v_ledger from public.compute_loan_ledger(v_loan.id, current_date);
    if v_ledger.outstanding <= 0 then
      continue;
    end if;

    -- upcoming deadline, within 3 days, not yet reminded
    if v_loan.due_date - current_date between 0 and 3 then
      select exists(
        select 1 from public.notifications
        where type = 'deadline_reminder'
          and payload ->> 'loan_id' = v_loan.id::text
      ) into v_already_reminded;

      if not v_already_reminded then
        insert into public.notifications (user_id, type, payload) values
          (v_loan.borrower_id, 'deadline_reminder', jsonb_build_object('loan_id', v_loan.id, 'due_date', v_loan.due_date)),
          (v_loan.lender_id, 'deadline_reminder', jsonb_build_object('loan_id', v_loan.id, 'due_date', v_loan.due_date));
        v_reminders := v_reminders + 1;
      end if;
    end if;

    -- overdue, not yet flagged
    if current_date > v_loan.due_date then
      select exists(
        select 1 from public.notifications
        where type = 'overdue'
          and payload ->> 'loan_id' = v_loan.id::text
      ) into v_already_overdue;

      if not v_already_overdue then
        insert into public.notifications (user_id, type, payload) values
          (v_loan.borrower_id, 'overdue', jsonb_build_object('loan_id', v_loan.id, 'due_date', v_loan.due_date)),
          (v_loan.lender_id, 'overdue', jsonb_build_object('loan_id', v_loan.id, 'due_date', v_loan.due_date));
        v_overdue := v_overdue + 1;
      end if;
    end if;
  end loop;

  reminders_sent := v_reminders;
  overdue_sent := v_overdue;
  return next;
end;
$$;

-- No grant to `authenticated` — this is an internal job function, invoked
-- only by the cron scheduler (running as the function owner) or manually
-- by a service-role/admin context. Client code must never call this.
revoke all on function public.send_deadline_reminders() from public, authenticated;

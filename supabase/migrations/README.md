# Monly Migration Plan

Phase 0 establishes the local Supabase schema/RLS foundation through
`0001`-`0010`. Phase 1 adds the identity and privacy RPCs in `0011`-`0013`.

When each later phase begins, create the corresponding SQL migration using the
exact approved filename below. Do not renumber these migrations.

```text
0001_enums.sql
0002_tables_profiles_privacy.sql
0003_tables_requests_offers.sql
0004_tables_loans_payments.sql
0005_tables_notifications.sql
0006_triggers_profile_bootstrap.sql
0007_triggers_updated_at.sql
0008_rls_profiles_privacy.sql
0009_rls_requests_offers.sql
0010_rls_loans_payments_notifications.sql
0011_fn_get_profile_visible.sql
0012_fn_update_username.sql
0013_fn_search_users.sql
0014_fn_accept_offer.sql
0015_fn_compute_and_get_loan_ledger.sql
0016_fn_record_payment.sql
0017_trigger_notifications_on_domain_events.sql
0018_cron_deadlines.sql
```

Important ordering rule: `0016_fn_record_payment.sql` depends on the
authoritative ledger functionality from
`0015_fn_compute_and_get_loan_ledger.sql`. Do not implement payment behavior
before the financial parity gate is complete.

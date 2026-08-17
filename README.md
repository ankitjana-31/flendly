# Monly

Track money you've lent or borrowed with people you actually trust — with proper interest math, a real negotiation flow, and privacy controls, instead of a spreadsheet or a screenshot of a UPI transfer.

## Overview

Monly is a peer-to-peer lending and debt-tracking app for informal loans between friends and family. Two people negotiate terms (amount, interest, deadline) through a request/offer/counter-offer flow, and once accepted, Monly tracks the loan's ledger — accrued interest, payments, outstanding balance — with the same interest-first payment allocation a real lender would use.

## Problem

Informal lending between friends is common and almost always tracked badly: a WhatsApp message, a mental note, a vague "pay me back whenever." Nobody agrees on how interest (if any) should accrue, partial payments get forgotten, and disputes happen because there's no shared source of truth.

## Solution

Monly makes the terms explicit and mutually agreed (via a negotiation flow, not a unilateral IOU), then keeps a single authoritative ledger both people can see. All financial calculations happen server-side in PostgreSQL — the client can preview an estimate, but it can never dictate the actual numbers.

## Features

- **Negotiation, not IOUs.** One person proposes amount/interest/deadline; the other can accept, counter, or decline. Counter-offers supersede the previous offer automatically.
- **Real interest math.** Simple or compound interest, at daily/monthly/yearly rates, calculated against actual calendar periods (not a 30/360 approximation) — implemented identically in PL/pgSQL (authoritative) and TypeScript (UI preview only).
- **Interest-first payment allocation.** Each payment pays down accrued interest before principal, exactly like a real loan, with overpayment handling and automatic payoff detection.
- **Privacy controls.** Users choose who can see their avatar, email, and phone number — visibility can be scoped to "only me," "people I'm transacting with," or "everyone."
- **Notifications** for every domain event: new request, counter-offer, offer accepted/declined, payment recorded, fully paid.

## Architecture

```
Browser (Next.js App Router, React 19)
   │
   ├─ Server Components — read via Supabase RLS-scoped queries
   ├─ Server Actions — writes, always via Postgres RPCs for anything
   │                    financial or state-machine-related
   │
   ▼
Supabase (PostgreSQL + Auth)
   ├─ RLS policies — row AND column-level access control
   ├─ SECURITY DEFINER RPCs — the only path to mutate loans/payments/
   │  requests/offers; encapsulate business rules & validation
   └─ Triggers — profile bootstrap on signup, offer supersession,
      notification fan-out
```

The database is the source of truth for every financial number. The TypeScript interest engine (`src/lib/interest/engine.ts`) exists purely to render a live "here's what this payment would do" preview in the UI — nothing it computes is ever trusted as an actual payment allocation. The server always recomputes from scratch via `record_payment()`.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Validation:** Zod (server actions), Decimal.js (money-safe arithmetic in the preview engine)
- **Testing:** Vitest

## Authentication

Google OAuth via Supabase Auth:

```
/auth/login → "Continue with Google" → Google OAuth consent
   → Supabase's own OAuth callback (configured in Google Cloud Console)
   → redirected to this app's /auth/callback with a `code` param
   → exchangeCodeForSession() establishes the session
   → profile lookup: placeholder username (user_xxxxxxxx)? → /complete-profile
                       otherwise → /dashboard
```

Session refresh and route protection both happen in `proxy.ts` / `src/lib/supabase/proxy.ts` (Next's middleware equivalent), which redirects unauthenticated users away from protected routes and users with incomplete profiles to `/complete-profile`.

**This requires two pieces of external configuration that can't live in the repo** — see [Supabase Setup](#supabase-setup) below.

## Database Architecture

19 sequential migrations under `supabase/migrations/`:

| Range | Contents |
|---|---|
| 0001 | Enums (request/offer/loan status, interest type/frequency, visibility levels, notification types) |
| 0002–0005 | Tables: `profiles`, `privacy_settings`, `loan_requests`, `loan_offers`, `loans`, `payments`, `notifications` |
| 0006–0007 | Triggers: profile bootstrap on signup, `updated_at` maintenance |
| 0008–0010 | RLS policies (row- and column-level) for every table |
| 0011–0013 | `get_profile_visible`, `update_username`, `search_users` |
| 0014 | `accept_offer` — atomic offer → loan conversion |
| 0015 | The interest engine: `calendar_periods_elapsed`, `accrue_simple_interest`, `accrue_compound_interest`, `compute_loan_ledger`, `get_loan_ledger` |
| 0016 | `record_payment` — interest-first allocation, payoff detection |
| 0017 | `create_request`, `decline_request`, `cancel_request` |
| 0018 | Notification trigger for counter-offers |
| 0019 | `update_profile_details` — the write path for `full_name`/`phone_number` |

Key design decisions:
- **`loan_offers` is append-only.** A counter-offer doesn't edit the previous offer; a `BEFORE INSERT` trigger marks the prior active offer `SUPERSEDED` and flips the request to `COUNTERED`. The full negotiation history is preserved.
- **Loan terms are frozen at acceptance.** `loans` copies the accepted offer's amount/rate/frequency rather than referencing it live, so a later data change can't retroactively alter an existing loan.
- **`payments` freezes its own interest/principal split at insert time**, computed by `record_payment()` from the ledger at that moment — it's never recalculated after the fact.
- **No table has a client-facing UPDATE/INSERT grant for anything that matters financially.** Every state transition goes through a `SECURITY DEFINER` RPC that re-validates ownership, status, and authorization from scratch.

## Financial Calculation Engine

Interest accrual walks real calendar periods from the loan's `start_date` (or the last payment date), not a nominal day-count convention:

- **Simple interest:** `principal × rate × periods_elapsed`, where `periods_elapsed` includes a fractional partial period (days into the next period ÷ that period's actual length).
- **Compound interest:** compounds at the loan's `compounding` frequency, converting the stated per-`interest_frequency` rate to a per-compounding-period rate first.

Verified fixture (used in both the SQL and TypeScript test suites): **₹100,000 at 12%/year, monthly compounding, over 6 months → ₹6,152.02** interest.

The ledger walk (`compute_loan_ledger`) replays every payment in chronological order, accruing interest up to each payment date, applying that payment interest-first, then continuing from the new principal. This is what makes multiple partial payments over time compute correctly instead of relying on a single formula.

## Security / RLS

- **Row-level security** on every table, scoped to the authenticated user's participation (sender/receiver, lender/borrower, payer/receiver).
- **Column-level grants** on `profiles` — a raw `select email, phone_number from profiles` is rejected outright (`permission denied for table profiles`) regardless of RLS, because those columns were never granted to the `authenticated` role in the first place. The only way to read another user's email/phone is through `get_profile_visible()`, which enforces the target's own privacy settings.
- **No table has a general client UPDATE grant for financial data.** Every mutation with business-rule implications (accepting an offer, recording a payment, changing a request's status) goes through a `SECURITY DEFINER` RPC that re-checks `auth.uid()` against the relevant participant column before doing anything.

This was verified against a real (local, disposable) Postgres instance with adversarial tests: a non-participant attempting to read, decline, accept, or pay against another pair's request/loan is rejected at every step; a lender attempting to record a payment on their own loan (only the borrower may) is rejected; privacy visibility settings were confirmed to correctly gate `get_profile_visible()` output between "only me," "participants," and strangers.

## Request & Negotiation Workflow

```
A creates a request to B (amount, interest terms, deadline)
   → B sees it as "incoming", A sees it as "sent"
   → B can Accept / Counter / Decline
        Counter → new offer supersedes the old one, status → COUNTERED
        Accept  → loan created atomically, request → ACCEPTED
        Decline → request → DECLINED
   → Either party can Cancel while still open (sender only, via cancel_request)
```

## Loan & Payment Workflow

```
Loan created at acceptance (terms frozen)
   → Borrower opens loan detail, sees live outstanding = principal + accrued interest
   → Borrower enters a payment amount/date
        UI shows an ESTIMATED interest/principal split (Decimal.js, client-side)
   → On submit, record_payment() RPC recomputes the split from scratch,
     server-side, from the actual ledger — the client's estimate is discarded
   → If the new outstanding balance is ≤ 0, loan status flips to PAID
        and paid_off_date is recorded (further interest accrual stops)
```

## Notifications

Fired directly from the RPC that causes them (not a generic afterthought trigger), so each notification always has full context: `new_request`, `counter_offer`, `offer_accepted`, `offer_declined`, `payment_recorded`, `fully_paid`. (`deadline_reminder`/`overdue` types exist in the schema but have no scheduled job producing them yet — see [Remaining Work](#remaining-work--future-improvements).)

## Project Structure

```
src/
  app/
    (app)/                  # authenticated route group — wrapped in AppShell
      dashboard/  lent/  borrowed/
      requests/  requests/new/  requests/[id]/
      loans/[id]/
      profile/  profile/settings/
      notifications/
    auth/login/  auth/callback/
    complete-profile/
    api/users/search/        # username autocomplete
  components/
    layout/                  # app shell (sidebar + mobile nav)
    negotiation/              # offer terms fields, counter-offer form, actions
    loans/                    # loan list card, payment form + preview
    notifications/  users/    # settings forms
    ui/                       # button, card, status badge
  lib/
    interest/engine.ts        # advisory-only TS interest engine + tests
    requests/  loans/  payments/  notifications/  privacy/  users/  auth/
    supabase/                 # browser/server clients, proxy (middleware)
    types/database.types.ts   # hand-maintained; see note below
supabase/migrations/          # 0001–0019, see Database Architecture above
```

**Note on `database.types.ts`:** this was hand-maintained rather than generated via `supabase gen types` (this environment had no live Supabase connection to introspect). It's kept in sync with the migrations manually. If you have Supabase CLI access, regenerating it with `supabase gen types typescript` against your actual project is worth doing periodically to catch any drift.

## Local Setup

```bash
git clone <this repo>
cd monly
npm install
cp .env.example .env.local   # fill in your Supabase project values
npm run dev
```

## Environment Variables

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API (the anon/publishable key — never the service-role key) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally; your production URL when deployed |

Never commit `.env.local`. Never put a service-role key behind `NEXT_PUBLIC_*`.

## Supabase Setup

Beyond running the migrations, two pieces of dashboard configuration are required for Google login to work — these are the most common source of the "unexpected page after Google sign-in" symptom, and can't be fixed from application code:

1. **Google Cloud Console** → your OAuth 2.0 Client → Authorized redirect URIs must include:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   (This is Supabase's own callback, *not* this app's `/auth/callback` — Google talks to Supabase first, and Supabase then redirects to this app.)

2. **Supabase Dashboard** → Authentication → Providers → Google: enabled, with the Google Client ID/Secret entered.

3. **Supabase Dashboard** → Authentication → URL Configuration:
   - **Site URL:** your production URL (or `http://localhost:3000` while developing)
   - **Redirect URLs:** must explicitly include `http://localhost:3000/auth/callback` (and the production equivalent) — if this app's callback URL isn't in this allow-list, Supabase will refuse the redirect and show its own error page instead of reaching `/auth/callback`.

## Database Migrations

Apply with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

All 19 migrations are idempotent-safe to run in sequence on a fresh database. If some of 0001–0013 were already applied by a previous session against your live project, only push 0014 onward — check `supabase migration list` first.

## Testing

```bash
npm test        # vitest — interest engine unit tests (20 tests)
npm run typecheck
npm run lint
npm run build
```

The interest engine test suite covers calendar period math, simple/compound accrual, the fixture from the spec (verified to match the PL/pgSQL implementation exactly), multi-payment ledger walks, overpayment, payoff-freezes-accrual, zero-interest loans, and the overdue/partially-paid predicates.

RLS and RPC authorization were verified manually against a disposable local Postgres instance (not committed as an automated suite — see Remaining Work).

## Deployment

1. Push this repo to GitHub.
2. Import into Vercel, set the three environment variables above (production `NEXT_PUBLIC_SITE_URL`).
3. In Supabase, run `supabase db push` against your production project (or apply migrations via the SQL editor).
4. Update Google Cloud Console + Supabase Auth URL Configuration with your production domain (see Supabase Setup above).
5. Confirm `/auth/login` → Google → `/auth/callback` → `/dashboard` end-to-end on the deployed URL before considering it done — OAuth config mistakes only show up in the real environment, not in `next build`.

## Future Improvements

- **Deadline reminders / overdue notifications.** The `deadline_reminder` and `overdue` notification types exist in the schema but nothing produces them yet — needs a scheduled job (Supabase `pg_cron` calling a small SQL function daily is the natural fit given the existing architecture) plus de-duplication logic so a loan doesn't get reminded every single day.
- **Avatar upload.** `avatar_url` is currently only ever set from the Google OAuth profile photo at signup; there's no in-app upload/change flow (would need Supabase Storage integration).
- **Automated RLS/RPC integration tests.** Currently verified manually against a local Postgres; would be worth scripting as a repeatable suite (e.g. `pgTAP` or a small Node harness against a Supabase local dev stack) rather than one-off manual verification.
- **Regenerate `database.types.ts` from a live project** via `supabase gen types` once CLI access to the real project is available, to eliminate any manual-maintenance drift risk.

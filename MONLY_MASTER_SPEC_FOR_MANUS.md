# MONLY — MASTER SPECIFICATION FOR MANUS

> This is the single-file handoff for Manus. It combines the Claude technical architecture, finalized implementation specification, corrected implementation plan, final product decisions, and the Manus UI/UX prompt.
>
> **Source hierarchy:** The technical architecture and financial/security rules come from Claude's finalized specification. The correction block in Part C below is authoritative where the earlier Part C draft contained migration numbering/phase inconsistencies. The UI/UX prompt at the end is the instruction for Manus.

---

# PART A — TECHNICAL ARCHITECTURE

# P2P Lending & Debt-Tracking Platform — Technical Architecture (Part A)

> Status: Architecture only. No application code. Greenfield — no reuse of the prior Mini Bank codebase or its patterns.

---

## 1. System Architecture

### 1.1 High-level shape

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 14+ (App Router)                  │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │  Server        │  │  Server        │  │  Client          │ │
│  │  Components    │  │  Actions       │  │  Components      │ │
│  │  (data reads)  │  │  (mutations)   │  │  (interactivity) │ │
│  └───────┬────────┘  └───────┬────────┘  └────────┬─────────┘ │
└──────────┼───────────────────┼────────────────────┼───────────┘
           │                   │                     │
           ▼                   ▼                     ▼
   ┌─────────────────────────────────────────────────────────┐
   │              Supabase (single project)                   │
   │  ┌───────────┐ ┌───────────┐ ┌────────────────────────┐ │
   │  │ Postgres   │ │ Auth       │ │ Realtime (notifications)│ │
   │  │ + RLS      │ │ (Google    │ │ Postgres Changes feed  │ │
   │  │ + RPC fns  │ │  OAuth)    │ │                         │ │
   │  └───────────┘ └───────────┘ └────────────────────────┘ │
   └─────────────────────────────────────────────────────────┘

```

### 1.2 Core architectural principles

1. **No custom backend server.** Next.js Server Actions + Route Handlers are the only application-tier compute. Supabase is the sole persistence and auth layer. No Express, no custom JWT, no session store — those are explicitly abandoned along with Mini Bank.
2. **Server-authoritative money math.** All interest accrual and outstanding-balance calculations happen in a pure TypeScript module invoked *only* from server-side code (Server Actions / RPC), never trusted from the client, and mirrored in Postgres via generated/computed views for defense-in-depth (see §6).
3. **RLS is the real security boundary**, not the UI. Every table assumes a hostile client. Server Actions add convenience and validation; they are not the security layer — Postgres is.
4. **Immutability where the domain requires it.** Offers and payments are append-only ledgers. Nothing in the domain model supports `UPDATE` on a historical offer or payment row (enforced by RLS: no `UPDATE`/`DELETE` policies granted on those tables at all — only `INSERT`/`SELECT`).
5. **State machines over booleans.** Request status, offer status, and loan status are enums with explicit, server-enforced transition tables (§7), not ad hoc boolean flags.

### 1.3 Request lifecycle (who does what)

| Step Actor Mechanism             |                               |                                                                                              |
| -------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| Read dashboard / lists           | Server Component              | Direct Supabase query using the user's session (RLS scoped)                                  |
| Create request / offer / counter | Client form → Server Action   | Validates input, calls Postgres RPC                                                          |
| Accept offer                     | Client button → Server Action | Calls atomic `accept_offer` RPC (§5)                                                         |
| Record payment                   | Client form → Server Action   | Calls `record_payment` RPC, revalidates loan detail                                          |
| Live notification badge          | Client Component              | Supabase Realtime subscription on `notifications` filtered by `user_id` (RLS-scoped channel) |

---

## 2. Database Schema

Postgres via Supabase. All monetary values `numeric(14,2)`. All timestamps `timestamptz`. All primary keys `uuid default gen_random_uuid()`.

### 2.1 `profiles`

| Column Type Notes    |             |                                            |
| -------------------- | ----------- | ------------------------------------------ |
| id                   | uuid PK     | `= auth.users.id` (1:1 with Supabase Auth) |
| username             | text        | unique, 3–20 chars, `[a-z0-9_]`            |
| username\_normalized | text        | generated: `lower(username)`, unique index |
| full\_name           | text        | from Google profile, editable              |
| email                | text        | from Google profile, not user-editable     |
| avatar\_url          | text        | nullable                                   |
| phone\_number        | text        | nullable, optional                         |
| created\_at          | timestamptz | default `now()`                            |
| updated\_at          | timestamptz | default `now()`, trigger-maintained        |

`profiles.id` has an FK to `auth.users(id) on delete cascade`. Row is created by a Postgres trigger on `auth.users` insert (not by client code) — this guarantees a profile row always exists post-signup and can't be forged or skipped.

### 2.2 `privacy_settings`

| Column Type Notes  |                                    |                                                                  |
| ------------------ | ---------------------------------- | ---------------------------------------------------------------- |
| user\_id           | uuid PK, FK → profiles(id)         | 1:1                                                              |
| avatar\_visibility | enum `visibility_level`            | `everyone` \| `participants` \| `nobody`, default `participants` |
| email\_visibility  | enum `visibility_level_restricted` | `only_me` \| `participants`, default `only_me`                   |
| phone\_visibility  | enum `visibility_level_restricted` | `only_me` \| `participants`, default `only_me`                   |
| updated\_at        | timestamptz                        |                                                                  |

Row auto-created alongside `profiles` (same trigger), defaulting to the private-by-default posture the spec requires. Note two distinct enums: avatar allows `everyone`; email/phone never do (spec disallows public email/phone).

### 2.3 `loan_requests`

| Column Type Notes  |                          |                                                             |
| ------------------ | ------------------------ | ----------------------------------------------------------- |
| id                 | uuid PK                  |                                                             |
| sender\_id         | uuid FK → profiles       | initiator                                                   |
| receiver\_id       | uuid FK → profiles       | counterparty                                                |
| direction          | enum `request_direction` | `lend` \| `borrow` — perspective of `sender_id`             |
| status             | enum `request_status`    | `PENDING`\|`COUNTERED`\|`ACCEPTED`\|`DECLINED`\|`CANCELLED` |
| created\_at        | timestamptz              |                                                             |
| updated\_at        | timestamptz              |                                                             |

Constraint: `sender_id <> receiver_id` (no self-requests). Index on `(sender_id, status)`, `(receiver_id, status)`.

### 2.4 `loan_offers`

| Column Type Notes   |                           |                                                                     |
| ------------------- | ------------------------- | ------------------------------------------------------------------- |
| id                  | uuid PK                   |                                                                     |
| request\_id         | uuid FK → loan\_requests  |                                                                     |
| created\_by         | uuid FK → profiles        | must be sender or receiver of the request                           |
| amount              | numeric(14,2)             | > 0                                                                 |
| interest\_type      | enum `interest_type`      | `none`\|`simple`\|`compound`                                        |
| interest\_rate      | numeric(6,3)              | required unless `interest_type = 'none'` (CHECK)                    |
| interest\_frequency | enum `interest_frequency` | `daily`\|`monthly`\|`yearly`, nullable when `interest_type='none'`  |
| compounding         | enum `interest_frequency` | only meaningful when `interest_type='compound'`; nullable otherwise |
| deadline            | date                      | required, must be a future date at creation time                    |
| message             | text                      | nullable, free text                                                 |
| status              | enum `offer_status`       | `ACTIVE`\|`SUPERSEDED`\|`ACCEPTED`\|`DECLINED`                      |
| created\_at         | timestamptz               |                                                                     |

Constraint: **partial unique index** `UNIQUE (request_id) WHERE status = 'ACTIVE'` — enforces "only one active offer per request" at the database level, not just in application logic.

### 2.5 `loans`

| Column Type Notes   |                                      |                                                              |
| ------------------- | ------------------------------------ | ------------------------------------------------------------ |
| id                  | uuid PK                              |                                                              |
| request\_id         | uuid FK → loan\_requests, **UNIQUE** | enforces "exactly one loan per request"                      |
| accepted\_offer\_id | uuid FK → loan\_offers, UNIQUE       |                                                              |
| lender\_id          | uuid FK → profiles                   |                                                              |
| borrower\_id        | uuid FK → profiles                   |                                                              |
| principal\_amount   | numeric(14,2)                        | copied from accepted offer at creation, immutable thereafter |
| interest\_type      | enum `interest_type`                 | copied, immutable                                            |
| interest\_rate      | numeric(6,3)                         | copied, immutable                                            |
| interest\_frequency | enum `interest_frequency`            | copied, immutable                                            |
| compounding         | enum `interest_frequency`            | copied, immutable                                            |
| start\_date         | date                                 | = date of acceptance (server clock)                          |
| due\_date           | date                                 | = accepted offer's `deadline`                                |
| status              | enum `loan_status`                   | `ACTIVE`\|`PAID` only (stored) — see §7.3 for derived state  |
| created\_at         | timestamptz                          |                                                              |
| updated\_at         | timestamptz                          |                                                              |

Terms are copied rather than joined-at-read-time so a loan's contractual terms remain historically stable even if that's already implied by offer immutability — this is defense-in-depth and also simplifies every downstream query (no join to `loan_offers` needed to compute interest).

### 2.6 `payments`

| Column Type Notes  |                    |                                                                                                   |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------------------- |
| id                 | uuid PK            |                                                                                                   |
| loan\_id           | uuid FK → loans    |                                                                                                   |
| payer\_id          | uuid FK → profiles | must equal `loans.borrower_id` (CHECK via trigger, not column constraint, since it's cross-table) |
| receiver\_id       | uuid FK → profiles | must equal `loans.lender_id`                                                                      |
| amount             | numeric(14,2)      | > 0                                                                                               |
| payment\_date      | date               | not in the future                                                                                 |
| note               | text               | nullable                                                                                          |
| created\_at        | timestamptz        |                                                                                                   |

No `UPDATE`/`DELETE` grants — corrections happen via an offsetting/reversal payment, never by mutating history. (If you want a "void payment" workflow later, that's a `voided_at` column + RLS change — not a schema break, but out of scope for V1 per your instruction not to over-invent.)

### 2.7 `notifications`

| Column Type Notes  |                          |                                                                                                                                      |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| id                 | uuid PK                  |                                                                                                                                      |
| user\_id           | uuid FK → profiles       | recipient                                                                                                                            |
| type               | enum `notification_type` | `new_request`\|`counter_offer`\|`offer_accepted`\|`offer_declined`\|`payment_recorded`\|`deadline_reminder`\|`overdue`\|`fully_paid` |
| payload            | jsonb                    | polymorphic reference data (request\_id / loan\_id / offer\_id / amount etc.)                                                        |
| read\_at           | timestamptz              | nullable                                                                                                                             |
| created\_at        | timestamptz              |                                                                                                                                      |

Populated by triggers on `loan_requests`, `loan_offers`, `loans`, `payments` — not by client-side inserts (RLS grants `SELECT`/`UPDATE (read_at)` only, no `INSERT` from the client role).

### 2.8 Entity-relationship diagram

```
erDiagram
    profiles ||--o| privacy_settings : has
    profiles ||--o{ loan_requests : "sends (sender_id)"
    profiles ||--o{ loan_requests : "receives (receiver_id)"
    loan_requests ||--o{ loan_offers : "has offers"
    profiles ||--o{ loan_offers : "creates (created_by)"
    loan_requests ||--o| loans : "resolves to (0 or 1)"
    loan_offers ||--o| loans : "accepted into"
    profiles ||--o{ loans : "lends (lender_id)"
    profiles ||--o{ loans : "borrows (borrower_id)"
    loans ||--o{ payments : "has payments"
    profiles ||--o{ payments : "pays (payer_id)"
    profiles ||--o{ payments : "receives (receiver_id)"
    profiles ||--o{ notifications : receives

```

---

## 3. Authentication

- **Supabase Auth, Google OAuth provider only.** No email/password provider enabled in the Supabase Auth settings. No phone/OTP provider enabled.
- Flow: `/auth/login` → Supabase `signInWithOAuth({provider: 'google'})` → Google consent → redirect to `/auth/callback` → Supabase exchanges code for session (`exchangeCodeForSession`) → session cookie set via `@supabase/ssr` → redirect to `/complete-profile` if `profiles.username IS NULL`, else `/dashboard`.
- **Route protection** via Next.js middleware (`middleware.ts`): refreshes the Supabase session cookie on every request and redirects unauthenticated users hitting protected routes to `/auth/login`. This is a UX convenience; the real enforcement is RLS.
- **Username assignment** is a required, server-validated step (`/complete-profile`) — a Server Action checks uniqueness (`username_normalized`) via the database's unique constraint (catch the constraint violation, don't pre-check-then-insert, to avoid a TOCTOU race) before allowing progression to `/dashboard`.
- No custom JWT is minted anywhere. The Supabase session JWT (short-lived, auto-refreshed) is the only token in the system, and Postgres RLS policies read `auth.uid()` directly from it — there is no application-level session table to keep in sync.

---

## 4. Row-Level Security (RLS)

RLS is enabled on every table. Summary of policies (SQL detailed at implementation time):

| Table SELECT INSERT UPDATE DELETE  |                                                                                                                                                                                                 |                                                                                                         |                                                                                                             |      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---- |
| `profiles`                         | own row full; others' rows via `can_view_profile_field()` gating (see §4.1) for sensitive columns, public columns (`username`, `full_name`) always visible to any authenticated user for search | own row only, server trigger-driven, not client                                                         | own row only (username immutability enforced separately — see below)                                        | none |
| `privacy_settings`                 | own row only                                                                                                                                                                                    | none (trigger-created)                                                                                  | own row only                                                                                                | none |
| `loan_requests`                    | `auth.uid() IN (sender_id, receiver_id)`                                                                                                                                                        | `auth.uid() = sender_id` and `sender_id <> receiver_id`                                                 | none directly — status changes go through RPCs running as the row owner's privileges, not raw client UPDATE | none |
| `loan_offers`                      | `auth.uid() IN (SELECT sender_id/receiver_id FROM loan_requests WHERE id = request_id)`                                                                                                         | `auth.uid() = created_by` AND is a participant of the parent request AND request status is not terminal | **none** (immutable)                                                                                        | none |
| `loans`                            | `auth.uid() IN (lender_id, borrower_id)`                                                                                                                                                        | none (only via `accept_offer` RPC, `SECURITY DEFINER`)                                                  | none                                                                                                        | none |
| `payments`                         | `auth.uid() IN (payer_id, receiver_id)` (via loan)                                                                                                                                              | via `record_payment` RPC only                                                                           | none                                                                                                        | none |
| `notifications`                    | `auth.uid() = user_id`                                                                                                                                                                          | none (trigger-created)                                                                                  | `auth.uid() = user_id`, restricted to the `read_at` column only                                             | none |

### 4.1 Enforcing "Everyone / Participants / Nobody" for profile fields

A plain RLS `USING` clause can gate row visibility but is awkward for *per-field* visibility that depends on whether the viewer is currently a negotiation/loan participant with that specific profile owner. Approach:

- `profiles` table itself has **no RLS restriction** on the *public* columns (`id`, `username`, `full_name`) — needed for search.
- `avatar_url`, `email`, `phone_number` are **not selected directly** by client code. Instead, a Postgres function `get_profile(target_id uuid)` (`SECURITY DEFINER`) computes, per requester (`auth.uid()`), whether they are a participant (exists a `loan_requests` or `loans` row linking the two users) and returns `NULL` for any field the privacy setting hides. All profile reads in the app go through this function (as an RPC, or wrapped in a view `profiles_visible`), never through a raw `select * from profiles`.
- This keeps the enforcement 100% server-side and impossible to bypass from the client, matching "never rely on React to hide sensitive information."

### 4.2 Username immutability / uniqueness race

`UPDATE` on `profiles` is allowed only for the owner, and only via a Server Action that goes through a dedicated RPC rather than a raw client `update()` — this lets us centralize the "can this user still change their username" business rule (e.g., you may choose to allow one-time change only) without a schema change later. Uniqueness itself is guaranteed by the `username_normalized` unique index regardless of which path writes it.

---

## 5. Core State Machines

### 5.1 `loan_requests.status`

```
PENDING ──(counterparty counters)──► COUNTERED
PENDING ──(counterparty declines)──► DECLINED   [terminal]
PENDING ──(sender cancels)────────► CANCELLED  [terminal]
COUNTERED ──(either side counters again)──► COUNTERED (self-loop, new offer)
COUNTERED ──(either side declines)────────► DECLINED [terminal]
COUNTERED ──(either side cancels)─────────► CANCELLED [terminal]
COUNTERED/PENDING ──(offer accepted)──────► ACCEPTED [terminal]

```

Enforced server-side: only PENDING/COUNTERED are non-terminal; any mutation attempted against a terminal request is rejected by the RPC (checked inside the same transaction as the write, not pre-checked then written).

### 5.2 `loan_offers.status`

```
ACTIVE ──(superseded by new counter-offer)──► SUPERSEDED [terminal]
ACTIVE ──(accepted)──────────────────────────► ACCEPTED  [terminal]
ACTIVE ──(request declined)──────────────────► DECLINED  [terminal]

```

Only one row per `request_id` may be `ACTIVE` at a time (partial unique index, §2.4).

### 5.3 `loans.status` (stored) + derived state

**Stored** (only two values, deliberately minimal per your instruction not to conflate overdue/partial with the stored lifecycle):

```
ACTIVE ──(outstanding reaches 0)──► PAID [terminal]

```

**Derived** (computed at read time, never stored, so they can never drift from reality):

```
outstanding(loan, as_of := today)
    = principal_amount
    + accrued_interest(loan, as_of)
    - sum(payments.amount where loan_id = loan.id and payment_date <= as_of)

isPartiallyPaid(loan) = sum(payments) > 0 AND outstanding > 0
isOverdue(loan)       = today > due_date AND outstanding > 0 AND status = 'ACTIVE'

```

A loan can therefore simultaneously be `ACTIVE`, `isOverdue = true`, and `isPartiallyPaid = true` — exactly the non-exclusivity your spec requires. These derived booleans are computed by the same TypeScript interest module used for the ledger (§6), exposed to Server Components as plain function calls, and never persisted as columns (avoids a whole class of staleness bugs).

### 5.4 Acceptance transaction (atomicity)

Implemented as a single Postgres function `accept_offer(offer_id uuid)`, `SECURITY DEFINER`, callable only by an authenticated participant:

```
BEGIN
  SELECT ... FOR UPDATE  -- lock the request row
  1. verify auth.uid() is sender or receiver of the request
  2. verify offer.status = 'ACTIVE' and offer.request_id matches
  3. verify request.status is not terminal
  4. UPDATE loan_offers SET status = 'ACCEPTED' WHERE id = offer_id
  5. INSERT INTO loans (...) VALUES (...)   -- fails on UNIQUE(request_id) if a race occurred
  6. UPDATE loan_requests SET status = 'ACCEPTED'
  7. INSERT notification rows for both parties
COMMIT

```

`SELECT ... FOR UPDATE` on the parent `loan_requests` row plus the `UNIQUE(request_id)` constraint on `loans` together close the concurrent-acceptance race even under Postgres's default `READ COMMITTED` isolation — the row lock serializes concurrent callers, and the unique constraint is the final backstop if the lock strategy is ever bypassed (e.g., a future direct-SQL admin path).

---

## 6. Interest Engine & Payment Ledger

### 6.1 Interest engine — pure module, `lib/interest/`

Design constraints:

- **Pure functions.** No I/O, no Supabase client, no `Date.now()` implicitly — `as_of` is always an explicit parameter. This makes it unit-testable without a database and safely reusable both server-side (Server Actions/RPC-adjacent logic) and inside Postgres-side validation if ever needed.
- **Decimal-safe.** JavaScript `number` is not used for money math — use a fixed-point/decimal library (e.g. `decimal.js` or `big.js`) throughout, converting only at the Postgres `numeric` boundary via string serialization (never through floats).
- **Function surface (illustrative signatures, not code):** 
  - `accrueSimpleInterest(principal, rate, frequency, startDate, asOf): Decimal`
  - `accrueCompoundInterest(principal, rate, frequency, compoundingFrequency, startDate, asOf): Decimal`
  - `calculateAccruedInterest(loanTerms, asOf): Decimal` — dispatches by `interest_type`
  - `calculateOutstanding(loanTerms, payments[], asOf): Decimal`
  - `isOverdue(loanTerms, outstanding, asOf): boolean`
  - `isPartiallyPaid(payments[], outstanding): boolean`
- **Day-count convention** must be pinned explicitly (this is a decision to make before implementation, not invent silently at code time): recommend **ACT/365** for daily/simple interest as the least surprising default for an Indian personal-finance context; monthly/yearly frequencies use calendar-month/calendar-year boundaries from `start_date`. This should be confirmed with you before Part B, since it's a genuine business decision, not an architecture detail.
- Interest accrues strictly from `loans.start_date` (= acceptance time), per your explicit instruction — never from request or negotiation timestamps, which the schema physically doesn't even have a "start" concept for prior to loan creation.

### 6.2 Payment ledger

- `payments` is append-only (§2.6). "Outstanding" is never a stored column anywhere — it's always `principal + accrued_interest − Σ(payments)`, recomputed on read by the interest engine. This guarantees the number shown is always correct, at the cost of a computation on every read (cheap: bounded by payment count per loan, indexed on `loan_id`).
- `record_payment(loan_id, amount, payment_date, note)` RPC, `SECURITY DEFINER`: 
  1. verify caller is `borrower_id` on the loan (payer)
  2. verify loan is `ACTIVE`
  3. verify `amount > 0`
  4. insert payment
  5. recompute outstanding; if `<= 0`, flip `loans.status = 'PAID'`
  6. insert `payment_recorded` notification (and `fully_paid` if applicable)

---

## 7. Security Summary

- **RLS everywhere**, default-deny (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY` with no permissive catch-all policy).
- **No trust in client-submitted IDs for authorization** — every RPC re-derives "am I allowed to do this" from `auth.uid()` against the database, never from a value passed in the payload.
- **`SECURITY DEFINER`** **functions are the only mutation path** for `loans`, `payments`, and offer acceptance — client-side `insert`/`update` calls against those tables are not granted at all, closing off any RLS-policy-bug surface on the most sensitive tables.
- **Privacy fields never leave the server unfiltered** (§4.1) — no client-side redaction.
- **Least-privilege Supabase roles**: the app uses the `anon`/`authenticated` roles exclusively; the `service_role` key is never exposed to any client bundle and is only used, if at all, in trusted server contexts (e.g., a cron job for deadline reminders).
- **Input validation** at the Server Action boundary (e.g. via `zod`) before anything touches Postgres, as a UX/defense-in-depth layer — not a substitute for the DB constraints in §2.

---

## 8. Folder Structure

```
app/
  (auth)/
    auth/login/page.tsx
    auth/callback/route.ts
  complete-profile/page.tsx
  (app)/
    dashboard/page.tsx
    lent/page.tsx
    borrowed/page.tsx
    requests/page.tsx
    requests/[id]/page.tsx
    loans/[id]/page.tsx
    profile/page.tsx
    profile/settings/page.tsx
    notifications/page.tsx
  layout.tsx
  globals.css

components/
  ui/                 # shared primitives (button, card, badge, dialog...)
  requests/           # request list, request detail, offer timeline
  loans/               # loan summary card, loan detail panel
  negotiation/        # negotiation timeline, counter-offer form
  theme/               # theme provider + toggle

lib/
  supabase/
    client.ts          # browser client
    server.ts           # server component client (cookies-based)
    middleware.ts        # session refresh helper
  interest/
    engine.ts            # pure interest math (§6.1)
    engine.test.ts
  loans/
    queries.ts           # typed read helpers
    actions.ts            # Server Actions wrapping RPCs
  offers/
    actions.ts
  payments/
    actions.ts
  privacy/
    visibility.ts         # client-side types mirroring get_profile() shape
  users/
    search.ts
  notifications/
    subscribe.ts          # Realtime subscription hook

supabase/
  migrations/
    0001_init_enums_and_tables.sql
    0002_rls_policies.sql
    0003_functions_accept_offer.sql
    0004_functions_record_payment.sql
    0005_triggers_notifications.sql
    0006_profile_visibility_function.sql
  seed.sql               # dev-only sample data, never run against prod

public/
  ...

```

---

## 9. Server Actions / Data-Access Surface

| Action Type Calls                                               |                             |                                                             |
| --------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------- |
| `createRequest(receiverUsername, direction, initialOfferTerms)` | Server Action               | INSERT `loan_requests` + INSERT `loan_offers` (transaction) |
| `counterOffer(requestId, newTerms)`                             | Server Action               | supersede active offer + insert new (transaction)           |
| `declineRequest(requestId)`                                     | Server Action               | UPDATE status → DECLINED (validated)                        |
| `cancelRequest(requestId)`                                      | Server Action               | UPDATE status → CANCELLED (sender only)                     |
| `acceptOffer(offerId)`                                          | Server Action               | RPC `accept_offer`                                          |
| `recordPayment(loanId, amount, date, note)`                     | Server Action               | RPC `record_payment`                                        |
| `searchUsers(query)`                                            | Server Component data fetch | SELECT on public profile columns only                       |
| `updatePrivacySettings(settings)`                               | Server Action               | UPDATE `privacy_settings`, own row                          |
| `updateUsername(newUsername)`                                   | Server Action               | RPC or guarded UPDATE, catches unique violation             |
| `markNotificationRead(id)`                                      | Server Action               | UPDATE `read_at`, own row                                   |

Route Handlers (`route.ts`) are used only where Server Actions don't fit: `/auth/callback` (OAuth code exchange) and optionally a `/api/cron/deadline-reminders` endpoint for scheduled notification generation.

---

## 10. Testing Strategy

- **Unit tests (Vitest/Jest):** `lib/interest/engine.ts` gets exhaustive coverage — simple vs. compound, all three frequencies, partial-period accrual, zero-interest, overdue boundary (`now == due_date` edge case), outstanding with multiple partial payments, negative-outstanding clamping.
- **Integration tests against a local Supabase instance** (via `supabase start`, Docker): RLS policy tests — assert that user A cannot `SELECT`/`INSERT`/`UPDATE` rows belonging to user B across every table; assert the `UNIQUE(request_id)` constraint actually rejects a second loan on concurrent `accept_offer` calls (simulate with two concurrent transactions).
- **State-machine tests:** table-driven tests asserting every illegal transition (e.g., accepting an already-ACCEPTED offer, countering a DECLINED request) is rejected by the RPC, not just by convention.
- **E2E (Playwright), happy path:** Google OAuth mocked in CI → complete profile → create request → counter → accept → record payment → verify dashboard numbers.
- **Visual/theme regression:** snapshot key pages in light and dark themes.

---

## 11. Deployment Strategy

- **Hosting:** Vercel (first-class Next.js App Router support, including Server Actions).
- **Database/Auth:** Supabase managed project (separate projects for `staging` and `production`; never share one Supabase project across environments).
- **Migrations:** Supabase CLI (`supabase migration up` / `supabase db push`) run in CI on merge to `main` (production) and on merge to `staging` branch, before the Vercel deploy for that environment completes — never apply migrations from a developer's machine against prod.
- **Environments:** `local` (Supabase local dev via Docker) → `staging` (Supabase staging project + Vercel preview) → `production`.
- **Secrets:** managed via Vercel environment variables per-environment; `SUPABASE_SERVICE_ROLE_KEY` (if used at all) is restricted to server-only env vars, never `NEXT_PUBLIC_*`.
- **Scheduled jobs** (deadline reminders, overdue-status notifications): Vercel Cron hitting a protected Route Handler, or Supabase's `pg_cron` running a SQL function directly — recommend `pg_cron` since the logic is a pure SQL scan of `loans` and avoids round-tripping through the app tier.

---

## 12. Environment Variables

```
# Public (browser-safe)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only
SUPABASE_SERVICE_ROLE_KEY=        # only if pg_cron/admin task needs it; never exposed to client bundle

# Google OAuth (configured in Supabase Auth dashboard, not app env, but documented here for setup)
# GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are entered into Supabase's Auth provider settings,
# not into the Next.js app directly.

# App
NEXT_PUBLIC_SITE_URL=              # used for OAuth redirect construction

```

No payment gateway, SMS, or wallet-provider keys exist anywhere in this list — consistent with the platform explicitly not touching money movement.

---

## 13. Open Questions for You Before Part B

1. **Day-count convention** for interest (ACT/365 recommended, §6.1) — confirm or override.
2. **Username change policy** — one-time only, or freely editable? Affects the `updateUsername` RPC's business rule (not the schema).
3. **Notification delivery beyond in-app Realtime** — is in-app-only acceptable for V1, or do you want email digests later (would need an email provider decision, currently out of scope)?
4. **Deadline reminder cadence** — e.g., 3 days before `due_date` — needs a concrete rule for the `pg_cron` job.

None of these block finishing the architecture, but they do affect exact function behavior in Part B, so worth settling before implementation.

---

# PART B — FINAL IMPLEMENTATION SPECIFICATION

# P2P Lending & Debt-Tracking Platform — Implementation Specification (Part B)

> Still specification stage. No Next.js/React code. This document finalizes schema, migrations, RPC contracts, validation, state machines, interest math, privacy, and notifications against your locked decisions, then lays out build phases.

---

## 0. Adjustments to Part A required by your decisions

Your instruction was to keep the existing architecture "unless these decisions require a necessary adjustment." Three of them do. Flagging before the SQL so nothing is silently changed:

| # Decision Adjustment required Why  |                                                          |                                                                                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3                                   | Payments applied interest-first, ledger shows allocation | `payments` gains `interest_component` and `principal_component` columns, computed and frozen at insert time. `loans` accrual model changes from a single flat formula to an **event-driven, reducing-balance ledger walk** (§6.3) | A flat `principal + accrued_interest − Σpayments` formula (Part A §6.2) cannot express "interest-first allocation" or the fact that principal reduces mid-loan, which changes subsequent accrual. This is a real computation-model change, not a cosmetic one.                                                                         |
| 4                                   | Username changeable once                                 | `profiles` gains `username_changed_count smallint default 0` with a `CHECK (username_changed_count <= 1)`                                                                                                                         | Part A had no field tracking change history.                                                                                                                                                                                                                                                                                           |
| 6                                   | Reminder cadence, no daily repeats                       | `loans` gains three nullable timestamp columns to make reminder dispatch idempotent                                                                                                                                               | Part A's notification triggers were event-driven (fire once per domain event). Deadline reminders are *time*-driven (a scheduled scan), which needs its own "have I already sent this" state — a notification-existence query against `notifications.payload` would work but is fragile/slow; dedicated columns are simpler and exact. |

Everything else in Part A (table set, RLS strategy, `SECURITY DEFINER` RPC-only mutation on `loans`/`payments`, append-only ledger, privacy model, Google OAuth, state machine shapes) is unchanged.

**Correction note (post-review):** the original draft of this document numbered `record_payment` as `0013` and the ledger functions it depends on (`compute_loan_ledger`/`get_loan_ledger`) as `0018`, which contradicts strict-numeric-order migration execution. This has been corrected in place — the ledger functions are now `0013` and `record_payment` is `0014`, with everything after shifted accordingly (§3, §7). No financial logic, RPC signature, or architectural decision changed — only filenames/ordering. Since this is still the pre-implementation specification stage (no migration has been applied to any real database), renumbering here is not a violation of the append-only migration policy — that policy governs migrations once they exist as applied, deployed files; it doesn't freeze a specification document before a single line has been written to disk in the actual repo.

---

## 1. Interest Calculation Specification

### 1.1 Rate semantics (Decision 1)

`interest_rate` is a **per-period rate, where the period is** **`interest_frequency`****.** No annualization, no conversion. 5% with `interest_frequency = monthly` means 5% of principal per calendar month, full stop.

Period length definitions (fixed constants, used for fractional/day-based accrual):

| `interest_frequency` Period definition  |                                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| `daily`                                 | 1 calendar day                                                                      |
| `monthly`                               | 1 calendar month, measured from the anchor date (see §1.2) — **not** a flat 30 days |
| `yearly`                                | 1 calendar year, measured from the anchor date                                      |

Using calendar-accurate month/year boundaries (via date-library month/year arithmetic, e.g. `date-fns addMonths/addYears` + `differenceInCalendarDays` for the fractional remainder) rather than a nominal 30/365 day-count avoids systematic drift on multi-month loans and matches how a person reading "5% per month" would expect it to behave.

### 1.2 Simple interest

```
accrued_simple(principal, rate, freq, anchorDate, asOf):
    fullPeriods, remainderDays = calendarPeriodsElapsed(freq, anchorDate, asOf)
    periodLenDaysAtRemainder = daysInPeriod(freq, anchorDate + fullPeriods periods)
    fractionalPeriod = remainderDays / periodLenDaysAtRemainder
    periodsElapsed = fullPeriods + fractionalPeriod
    return principal * (rate / 100) * periodsElapsed

```

`calendarPeriodsElapsed` walks whole periods forward from `anchorDate` (whole months/years/days) using calendar arithmetic, then measures the leftover days against the length of the *next* (partial) period — this is what makes Feb vs. Jan vs. 31-day months behave correctly for `monthly`.

### 1.3 Compound interest

`compounding` (a separate field, same enum) defines how often accrued interest is folded into principal for further accrual. `interest_frequency` still defines what the *quoted rate* means.

```
compoundPeriodRate(rate, interest_frequency, compounding):
    # Convert the quoted per-interest_frequency rate into an equivalent
    # per-compounding-period rate, using the ratio of calendar period lengths
    # anchored at the same date (so this is date-context-sensitive, not a
    # fixed multiplier like ×12).
    return rate * (nominalDays(compounding) / nominalDays(interest_frequency))
    # nominalDays: daily=1, monthly=365.2425/12, yearly=365.2425
    # (Gregorian mean lengths — used ONLY for rate conversion, never for
    # the accrual date walk itself, which stays calendar-exact per §1.2)

accrued_compound(principal, rate, interest_frequency, compounding, anchorDate, asOf):
    r = compoundPeriodRate(rate, interest_frequency, compounding) / 100
    fullPeriods, remainderDays = calendarPeriodsElapsed(compounding, anchorDate, asOf)
    compoundedPrincipal = principal * (1 + r) ^ fullPeriods
    # partial trailing period accrues simple interest on the compounded balance
    periodLen = daysInPeriod(compounding, anchorDate + fullPeriods periods)
    partial = compoundedPrincipal * r * (remainderDays / periodLen)
    return (compoundedPrincipal + partial) - principal   # interest-only component

```

Worked example (sanity check): principal ₹100,000, `interest_rate = 12`, `interest_frequency = yearly`, `compounding = monthly`, 6 months elapsed. `nominalDays(monthly)/nominalDays(yearly) ≈ 30.44/365.24 ≈ 0.0833` → `compoundPeriodRate ≈ 12 × 0.0833 = 1%` per month, compounded monthly for 6 full periods: `100000 × 1.01^6 − 100000 ≈ ₹6,152.02` interest accrued at the 6-month mark. This must be one of the unit-test fixtures (§8.1).

### 1.4 No-interest loans

`interest_type = none` → `accrued = 0` for all time. `interest_rate`, `interest_frequency`, `compounding` are `NULL` and CHECK-enforced as such.

### 1.5 Accrual anchor and continuation past due date (Decision 2)

- Anchor date for the *first* accrual segment is `loans.start_date` (unchanged from Part A — acceptance time, never negotiation time).
- Interest **keeps accruing past** **`due_date`** using the identical formula above — `due_date` is not a computational input to accrual at all, only to `isOverdue` (§4.3). There is no separate penalty/default rate in V1.
- Accrual stops only when the loan transitions to `PAID` (outstanding reaches zero). At that point `loans.paid_off_date` (new column, §2) freezes the ledger — no further accrual is computed past that date even if `asOf` is later, since there is nothing left owed.

### 1.6 Payment allocation: interest-first (Decision 3) — event-driven ledger

Because principal can shrink mid-loan (partial payments), and each payment must be shown split into interest vs. principal, outstanding is computed by **walking payments in chronological order**, not by a single closed-form formula over the life of the loan:

```
computeLedger(loanTerms, payments[], asOf):
    payments_sorted = sort(payments by payment_date asc, then created_at asc)
    principal = loanTerms.principal_amount
    unpaidInterest = 0
    anchor = loanTerms.start_date
    rows = []

    for p in payments_sorted where p.payment_date <= asOf:
        segmentInterest = accrue(loanTerms, principal, anchor, p.payment_date)  # §1.2/1.3, base=current principal
        unpaidInterest += segmentInterest
        interestPortion = min(p.amount, unpaidInterest)
        principalPortion = p.amount - interestPortion
        # Overpayment guard: principalPortion is capped so `principal` never goes negative.
        principalPortion = min(principalPortion, principal)
        applied = interestPortion + principalPortion
        overpaidExcess = p.amount - applied      # tracked, not silently dropped — see §3.4
        unpaidInterest -= interestPortion
        principal -= principalPortion
        anchor = p.payment_date
        rows.append({ payment: p, interestPortion, principalPortion, overpaidExcess,
                       principalAfter: principal, unpaidInterestAfter: unpaidInterest })

    tailInterest = accrue(loanTerms, principal, anchor, asOf)
    unpaidInterest += tailInterest
    outstanding = principal + unpaidInterest
    return { outstanding, principal, unpaidInterest, rows }

```

This function is the single source of truth for: `outstanding`, `isPartiallyPaid`, the loan-detail "negotiation-style" payment ledger table (showing, per payment, how much went to interest vs. principal), and the trigger condition for flipping `loans.status → PAID`.

**Overpayment handling (edge case, made explicit rather than silently invented):** if a payment exceeds the total currently owed, the excess is recorded (`overpaidExcess` surfaced in the UI/ledger row) but does **not** create a negative balance or a credit carried into future accrual — V1 has no concept of a lender-owes-borrower state. This is a reasonable minimal behavior; a future version could turn it into a credit note, but that's out of scope now.

---

## 2. Finalized Schema Deltas (on top of Part A §2)

```
-- profiles: username change limit
ALTER TABLE profiles
  ADD COLUMN username_changed_count smallint NOT NULL DEFAULT 0
    CHECK (username_changed_count >= 0 AND username_changed_count <= 1);

-- payments: interest/principal allocation, frozen at insert
ALTER TABLE payments
  ADD COLUMN interest_component numeric(14,2) NOT NULL CHECK (interest_component >= 0),
  ADD COLUMN principal_component numeric(14,2) NOT NULL CHECK (principal_component >= 0),
  ADD COLUMN overpaid_excess numeric(14,2) NOT NULL DEFAULT 0 CHECK (overpaid_excess >= 0),
  ADD CONSTRAINT payments_allocation_sums_to_amount
    CHECK (interest_component + principal_component + overpaid_excess = amount);

-- loans: payoff freeze date + idempotent reminder tracking
ALTER TABLE loans
  ADD COLUMN paid_off_date date,
  ADD COLUMN reminder_3day_sent_at timestamptz,
  ADD COLUMN reminder_due_sent_at timestamptz,
  ADD COLUMN reminder_overdue_sent_at timestamptz;

```

---

## 3. Database Migrations (final file list)

```
supabase/migrations/
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
  0012_fn_accept_offer.sql
  0013_fn_compute_and_get_loan_ledger.sql
  0014_fn_record_payment.sql
  0015_fn_update_username.sql
  0016_fn_search_users.sql
  0017_triggers_notifications_on_domain_events.sql
  0018_cron_deadline_reminders.sql

```

### 3.1 `0001_enums.sql`

```
create type visibility_level as enum ('everyone', 'participants', 'nobody');
create type visibility_level_restricted as enum ('only_me', 'participants');
create type request_direction as enum ('lend', 'borrow');
create type request_status as enum ('PENDING','COUNTERED','ACCEPTED','DECLINED','CANCELLED');
create type offer_status as enum ('ACTIVE','SUPERSEDED','ACCEPTED','DECLINED');
create type interest_type as enum ('none','simple','compound');
create type interest_frequency as enum ('daily','monthly','yearly');
create type loan_status as enum ('ACTIVE','PAID');
create type notification_type as enum (
  'new_request','counter_offer','offer_accepted','offer_declined',
  'payment_recorded','deadline_reminder','overdue','fully_paid'
);

```

### 3.2 `0002_tables_profiles_privacy.sql`

```
create table profiles (
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
create unique index profiles_username_normalized_key on profiles (username_normalized);

create table privacy_settings (
  user_id uuid primary key references profiles(id) on delete cascade,
  avatar_visibility visibility_level not null default 'participants',
  email_visibility visibility_level_restricted not null default 'only_me',
  phone_visibility visibility_level_restricted not null default 'only_me',
  updated_at timestamptz not null default now()
);

```

### 3.3 `0003_tables_requests_offers.sql`

```
create table loan_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles(id),
  receiver_id uuid not null references profiles(id),
  direction request_direction not null,
  status request_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_self_request check (sender_id <> receiver_id)
);
create index loan_requests_sender_status_idx on loan_requests (sender_id, status);
create index loan_requests_receiver_status_idx on loan_requests (receiver_id, status);

create table loan_offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references loan_requests(id),
  created_by uuid not null references profiles(id),
  amount numeric(14,2) not null check (amount > 0),
  interest_type interest_type not null,
  interest_rate numeric(6,3) check (
    (interest_type = 'none' and interest_rate is null) or
    (interest_type <> 'none' and interest_rate is not null and interest_rate >= 0)
  ),
  interest_frequency interest_frequency check (
    (interest_type = 'none' and interest_frequency is null) or
    (interest_type <> 'none' and interest_frequency is not null)
  ),
  compounding interest_frequency check (
    (interest_type = 'compound' and compounding is not null) or
    (interest_type <> 'compound' and compounding is null)
  ),
  deadline date not null,
  message text,
  status offer_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  constraint deadline_in_future_at_creation check (deadline > created_at::date)
);
create unique index loan_offers_one_active_per_request
  on loan_offers (request_id) where (status = 'ACTIVE');
create index loan_offers_request_idx on loan_offers (request_id);

```

### 3.4 `0004_tables_loans_payments.sql`

```
create table loans (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references loan_requests(id),
  accepted_offer_id uuid not null unique references loan_offers(id),
  lender_id uuid not null references profiles(id),
  borrower_id uuid not null references profiles(id),
  principal_amount numeric(14,2) not null check (principal_amount > 0),
  interest_type interest_type not null,
  interest_rate numeric(6,3),
  interest_frequency interest_frequency,
  compounding interest_frequency,
  start_date date not null,
  due_date date not null,
  status loan_status not null default 'ACTIVE',
  paid_off_date date,
  reminder_3day_sent_at timestamptz,
  reminder_due_sent_at timestamptz,
  reminder_overdue_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lender_ne_borrower check (lender_id <> borrower_id),
  constraint paid_off_date_requires_paid check (
    (status = 'PAID' and paid_off_date is not null) or
    (status = 'ACTIVE' and paid_off_date is null)
  )
);
create index loans_lender_status_idx on loans (lender_id, status);
create index loans_borrower_status_idx on loans (borrower_id, status);

create table payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references loans(id),
  payer_id uuid not null references profiles(id),
  receiver_id uuid not null references profiles(id),
  amount numeric(14,2) not null check (amount > 0),
  interest_component numeric(14,2) not null check (interest_component >= 0),
  principal_component numeric(14,2) not null check (principal_component >= 0),
  overpaid_excess numeric(14,2) not null default 0 check (overpaid_excess >= 0),
  payment_date date not null,
  note text,
  created_at timestamptz not null default now(),
  constraint payments_allocation_sums_to_amount
    check (interest_component + principal_component + overpaid_excess = amount),
  constraint payment_not_future check (payment_date <= now()::date)
);
create index payments_loan_idx on payments (loan_id, payment_date, created_at);

```

Cross-table checks that can't be plain `CHECK` constraints (payer must equal `loans.borrower_id`, receiver must equal `loans.lender_id`) are enforced inside `record_payment` (§4.2) — the table has no direct client `INSERT` grant, so this is airtight, not just convention.

### 3.5 `0005_tables_notifications.sql`

```
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  type notification_type not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_unread_idx on notifications (user_id, read_at, created_at desc);

```

### 3.6 `0006_triggers_profile_bootstrap.sql`

```
create function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, email, username, full_name, avatar_url)
  values (new.id, new.email, 'user_' || substr(new.id::text, 1, 8), null, null);
  insert into privacy_settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

```

Note: `username` is bootstrapped to a placeholder (`user_xxxxxxxx`) so the NOT NULL/format constraints hold immediately; `/complete-profile` then forces the user to pick a real one via `update_username` before reaching `/dashboard`. This first mandatory pick does **not** count against the one-change allowance (see §4.4).

### 3.7 `0007_triggers_updated_at.sql`

Generic `set_updated_at()` trigger function attached to `profiles`, `privacy_settings`, `loan_requests`, `loans`.

### 3.8 `0008–0010` — RLS

Enable RLS on all seven tables. Representative policies (full set follows the same shape):

```
alter table loan_requests enable row level security;
create policy loan_requests_select on loan_requests
  for select using (auth.uid() in (sender_id, receiver_id));
create policy loan_requests_insert on loan_requests
  for insert with check (auth.uid() = sender_id);
-- No client UPDATE policy: status transitions go through RPCs only.

alter table loan_offers enable row level security;
create policy loan_offers_select on loan_offers
  for select using (
    auth.uid() in (
      select sender_id from loan_requests where id = loan_offers.request_id
      union
      select receiver_id from loan_requests where id = loan_offers.request_id
    )
  );
create policy loan_offers_insert on loan_offers
  for insert with check (
    auth.uid() = created_by
    and auth.uid() in (
      select sender_id from loan_requests where id = request_id
      union
      select receiver_id from loan_requests where id = request_id
    )
    and exists (
      select 1 from loan_requests
      where id = request_id and status in ('PENDING','COUNTERED')
    )
  );
-- No UPDATE/DELETE policy anywhere on loan_offers: immutable.

alter table loans enable row level security;
create policy loans_select on loans
  for select using (auth.uid() in (lender_id, borrower_id));
-- No INSERT/UPDATE/DELETE policy: only accept_offer() (security definer) writes here.

alter table payments enable row level security;
create policy payments_select on payments
  for select using (auth.uid() in (payer_id, receiver_id));
-- No INSERT/UPDATE/DELETE policy: only record_payment() (security definer) writes here.

alter table notifications enable row level security;
create policy notifications_select on notifications
  for select using (auth.uid() = user_id);
create policy notifications_mark_read on notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  -- application layer restricts the UPDATE to the read_at column only

alter table profiles enable row level security;
create policy profiles_select_public_columns on profiles for select using (true);
  -- sensitive columns (avatar_url/email/phone_number) are never selected directly by
  -- client code; all reads go through get_profile_visible() (§4.1), which is what
  -- actually enforces field-level privacy.
create policy profiles_update_own on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

alter table privacy_settings enable row level security;
create policy privacy_settings_select_own on privacy_settings
  for select using (auth.uid() = user_id);
create policy privacy_settings_update_own on privacy_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

```

### 3.9 `0011_fn_get_profile_visible.sql` — privacy enforcement

```
create function get_profile_visible(target_id uuid)
returns table (
  id uuid, username text, full_name text,
  avatar_url text, email text, phone_number text
)
language plpgsql security definer as $$
declare
  viewer uuid := auth.uid();
  is_participant boolean;
  p record;
  s record;
begin
  select * into p from profiles where profiles.id = target_id;
  select * into s from privacy_settings where privacy_settings.user_id = target_id;

  is_participant := (viewer = target_id) or exists (
    select 1 from loan_requests
    where (sender_id = viewer and receiver_id = target_id)
       or (sender_id = target_id and receiver_id = viewer)
    union
    select 1 from loans
    where (lender_id = viewer and borrower_id = target_id)
       or (lender_id = target_id and borrower_id = viewer)
  );

  return query select
    p.id, p.username, p.full_name,
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

```

Granted `EXECUTE` to `authenticated` only. All profile display (search results, negotiation panels, loan detail participant cards) calls this function — never a raw `select * from profiles`.

### 3.10 `0012_fn_accept_offer.sql`

```
create function accept_offer(p_offer_id uuid)
returns uuid  -- returns new loan id
language plpgsql security definer as $$
declare
  v_offer loan_offers%rowtype;
  v_request loan_requests%rowtype;
  v_lender uuid; v_borrower uuid; v_loan_id uuid;
begin
  select * into v_request from loan_requests
    where id = (select request_id from loan_offers where id = p_offer_id)
    for update;  -- serializes concurrent acceptance attempts

  if v_request.id is null then raise exception 'request not found'; end if;
  if auth.uid() not in (v_request.sender_id, v_request.receiver_id) then
    raise exception 'not a participant';
  end if;
  if v_request.status not in ('PENDING','COUNTERED') then
    raise exception 'request is not open for acceptance';
  end if;

  select * into v_offer from loan_offers where id = p_offer_id;
  if v_offer.status <> 'ACTIVE' then raise exception 'offer is not active'; end if;

  -- direction determines who lends / who borrows
  if v_request.direction = 'lend' then
    v_lender := v_request.sender_id; v_borrower := v_request.receiver_id;
  else
    v_lender := v_request.receiver_id; v_borrower := v_request.sender_id;
  end if;

  update loan_offers set status = 'ACCEPTED' where id = p_offer_id;

  insert into loans (
    request_id, accepted_offer_id, lender_id, borrower_id,
    principal_amount, interest_type, interest_rate, interest_frequency,
    compounding, start_date, due_date
  ) values (
    v_request.id, v_offer.id, v_lender, v_borrower,
    v_offer.amount, v_offer.interest_type, v_offer.interest_rate,
    v_offer.interest_frequency, v_offer.compounding, current_date, v_offer.deadline
  ) returning id into v_loan_id;
  -- UNIQUE(request_id) / UNIQUE(accepted_offer_id) is the final backstop against races

  update loan_requests set status = 'ACCEPTED', updated_at = now() where id = v_request.id;

  insert into notifications (user_id, type, payload) values
    (v_lender, 'offer_accepted', jsonb_build_object('loan_id', v_loan_id, 'request_id', v_request.id)),
    (v_borrower, 'offer_accepted', jsonb_build_object('loan_id', v_loan_id, 'request_id', v_request.id));

  return v_loan_id;
end;
$$;

```

### 3.11 `0013_fn_compute_and_get_loan_ledger.sql`

> **Reordered.** This migration now comes *before* `record_payment` (§3.12) because `record_payment` calls it. See the correction note at the end of §0 for why the numbering changed from the original Part B draft.

- `compute_loan_ledger(p_loan_id uuid, p_as_of date)` — internal PL/pgSQL function implementing the §1.6 algorithm exactly (walks `payments` for the loan in `(payment_date, created_at)` order, tracks running `principal`/`unpaidInterest`, calls the §1.2/§1.3 accrual formulas between events). Returns `(outstanding numeric, principal numeric, unpaid_interest numeric)`. Not directly callable by clients (no `EXECUTE` grant to `authenticated`) — it's a building block for `record_payment` and `get_loan_ledger`.
- `get_loan_ledger(p_loan_id uuid)` — `SECURITY DEFINER`, `EXECUTE` granted to `authenticated`. Checks the caller is `lender_id` or `borrower_id` on the loan (mirrors `loans_select` RLS), then calls `compute_loan_ledger(p_loan_id, current_date)` plus returns the full per-payment breakdown (reading the already-stored `interest_component`/`principal_component`/`overpaid_excess` columns from `payments` — no recomputation of historical rows, since those are frozen at insert time). This is what the loan-detail page and dashboard call for every authoritative figure they display.

### 3.12 `0014_fn_record_payment.sql`

**Signature:** `record_payment(p_loan_id uuid, p_amount numeric, p_payment_date date, p_note text default null) returns uuid` — deliberately accepts **only** these four inputs. No component/allocation/outstanding value is ever an argument (see §7, finalized).

Responsibilities:

1. Verify `auth.uid() = loans.borrower_id` and `loans.status = 'ACTIVE'` (`for update` lock on the loan row — serializes concurrent payment attempts on the same loan the same way `accept_offer` serializes acceptance).
2. Verify `p_amount > 0` and `p_payment_date <= current_date`.
3. Call `compute_loan_ledger(p_loan_id, p_payment_date)` (§3.11 / §7) to get authoritative `unpaidInterest` and `principal` as of `p_payment_date`, over all *existing* payments only.
4. Compute, in PL/pgSQL, `interest_component = least(p_amount, unpaidInterest)`, `principal_component = least(p_amount - interest_component, principal)`, `overpaid_excess = p_amount - interest_component - principal_component`.
5. Insert the `payments` row with all three components populated — this INSERT is the only place these columns are ever written, and it happens with values PL/pgSQL just computed itself, not values received from any caller.
6. Re-run `compute_loan_ledger(p_loan_id, p_payment_date)` including the just-inserted payment; if resulting `outstanding <= 0`, `update loans set status = 'PAID', paid_off_date = p_payment_date`.
7. Insert `payment_recorded` notification to `receiver_id` (lender); insert `fully_paid` notification to both parties if the loan just closed.

### 3.13 `0015_fn_update_username.sql`

```
create function update_username(p_new_username text)
returns void language plpgsql security definer as $$
declare v_count smallint; v_is_first_pick boolean;
begin
  select username_changed_count into v_count from profiles where id = auth.uid();
  v_is_first_pick := (select username from profiles where id = auth.uid()) like 'user\_________';
    -- placeholder pattern from handle_new_user(); first real pick is free

  if not v_is_first_pick and v_count >= 1 then
    raise exception 'username can only be changed once';
  end if;

  update profiles
    set username = p_new_username,
        username_changed_count = case when v_is_first_pick then username_changed_count
                                       else username_changed_count + 1 end,
        updated_at = now()
    where id = auth.uid();
  -- unique index on username_normalized raises a constraint violation on collision,
  -- which the Server Action catches and surfaces as "username taken"
end;
$$;

```

### 3.14 `0016_fn_search_users.sql`

`SECURITY INVOKER` (not definer — it only touches already-public columns), searches `username_normalized ilike pattern` and `full_name`, excludes `auth.uid()` itself, returns only `id, username, full_name` (avatar handled separately per-result via `get_profile_visible` if the UI needs avatars in search results).

### 3.15 `0017_triggers_notifications_on_domain_events.sql`

Triggers on `loan_requests` (INSERT → `new_request` to receiver), `loan_offers` (INSERT where it supersedes an existing offer → `counter_offer` to the *other* party), `loan_requests` status→`DECLINED` (→ `offer_declined` to both). `offer_accepted`/`payment_recorded`/`fully_paid` are emitted directly inside `accept_offer`/`record_payment` (§3.10/§3.12) rather than via trigger, since those functions already have all the context and it avoids a second round-trip through trigger logic for the same event.

### 3.16 `0018_cron_deadline_reminders.sql` — Decision 6

```
create function dispatch_deadline_reminders() returns void
language plpgsql security definer as $$
begin
  -- 3-day-before reminder
  insert into notifications (user_id, type, payload)
    select borrower_id, 'deadline_reminder', jsonb_build_object('loan_id', id)
    from loans
    where status = 'ACTIVE'
      and due_date = current_date + 3
      and reminder_3day_sent_at is null;
  update loans set reminder_3day_sent_at = now()
    where status = 'ACTIVE' and due_date = current_date + 3 and reminder_3day_sent_at is null;

  -- due-date reminder
  insert into notifications (user_id, type, payload)
    select borrower_id, 'deadline_reminder', jsonb_build_object('loan_id', id)
    from loans
    where status = 'ACTIVE' and due_date = current_date and reminder_due_sent_at is null;
  update loans set reminder_due_sent_at = now()
    where status = 'ACTIVE' and due_date = current_date and reminder_due_sent_at is null;

  -- first-time overdue notice (fires once, ever, per loan)
  insert into notifications (user_id, type, payload)
    select borrower_id, 'overdue', jsonb_build_object('loan_id', id)
    from loans
    where status = 'ACTIVE' and due_date < current_date and reminder_overdue_sent_at is null;
  update loans set reminder_overdue_sent_at = now()
    where status = 'ACTIVE' and due_date < current_date and reminder_overdue_sent_at is null;
end;
$$;

select cron.schedule('deadline-reminders-daily', '0 3 * * *', $$select dispatch_deadline_reminders()$$);

```

Each `UPDATE ... WHERE ... IS NULL` runs in the same transaction as its matching `INSERT`, so a mid-run failure can't send the notification without recording that it was sent (or vice versa) — re-running the job is safe. The three `*_sent_at` columns are exactly what makes "don't repeat overdue notifications daily" hold: once set, the `WHERE reminder_overdue_sent_at IS NULL` predicate excludes that loan from all future runs, for that reminder type, permanently — until the loan is fully paid (`ACTIVE → PAID` is terminal-in-practice for reminders too; no reminders fire on `PAID` loans since every query filters `status = 'ACTIVE'`).

Scheduled once daily (03:00 UTC, adjust to a sensible off-peak IST hour, e.g. `30 21 * * *` for \~3:00 AM IST) via `pg_cron`, per Part A §11.

---

## 4. Validation Rules (consolidated)

| Entity Rule Enforced by  |                                                                           |                             |
| ------------------------ | ------------------------------------------------------------------------- | --------------------------- |
| Request                  | `sender_id ≠ receiver_id`                                                 | CHECK constraint            |
| Request                  | Only sender/receiver can read; only sender can insert                     | RLS                         |
| Offer                    | `amount > 0`                                                              | CHECK                       |
| Offer                    | `deadline` is a future date at creation                                   | CHECK                       |
| Offer                    | Rate/frequency/compounding null-ness matches `interest_type`              | CHECK                       |
| Offer                    | Only one `ACTIVE` offer per request                                       | Partial unique index        |
| Offer                    | Creator must be a participant, request must be open                       | RLS `INSERT` policy         |
| Loan                     | `lender_id ≠ borrower_id`                                                 | CHECK                       |
| Loan                     | Exactly one loan per request                                              | `UNIQUE(request_id)`        |
| Loan                     | Exactly one loan per accepted offer                                       | `UNIQUE(accepted_offer_id)` |
| Loan                     | `paid_off_date` set iff `status = 'PAID'`                                 | CHECK                       |
| Payment                  | `amount > 0`, `payment_date` not in the future                            | CHECK                       |
| Payment                  | Components sum exactly to `amount`                                        | CHECK                       |
| Payment                  | Only via `record_payment`, only by the borrower, only on an `ACTIVE` loan | RPC body (no direct grant)  |
| Username                 | Format `[a-z0-9_]{3,20}`, case-insensitive uniqueness                     | CHECK + unique index        |
| Username                 | ≤ 1 change post-registration (first mandatory pick is free)               | `update_username` RPC       |
| Privacy                  | Sensitive fields default private (`only_me`/`participants`)               | Column defaults             |
| Privacy                  | Field visibility computed server-side per viewer                          | `get_profile_visible`       |

---

## 5. Finalized State Transition Tables

Unchanged in shape from Part A §7.1–7.3; restated here with the RPC/trigger that legally causes each edge, since Part A only listed the edges:

**`loan_requests.status`**

| From To Caused by  |           |                                      |
| ------------------ | --------- | ------------------------------------ |
| —                  | PENDING   | `createRequest` action (insert)      |
| PENDING/COUNTERED  | COUNTERED | `counterOffer` action                |
| PENDING/COUNTERED  | DECLINED  | `declineRequest` action              |
| PENDING/COUNTERED  | CANCELLED | `cancelRequest` action (sender only) |
| PENDING/COUNTERED  | ACCEPTED  | `accept_offer` RPC only              |

**`loan_offers.status`**

| From To Caused by  |            |                                                                         |
| ------------------ | ---------- | ----------------------------------------------------------------------- |
| —                  | ACTIVE     | insert (initial offer or counter)                                       |
| ACTIVE             | SUPERSEDED | insert of the next counter-offer (same transaction)                     |
| ACTIVE             | ACCEPTED   | `accept_offer` RPC                                                      |
| ACTIVE             | DECLINED   | `declineRequest` action, cascades to the request's current active offer |

**`loans.status`** (stored) + derived (§1.6, using the ledger walk, not the flat formula from Part A)

| From To Caused by  |        |                                                                  |
| ------------------ | ------ | ---------------------------------------------------------------- |
| —                  | ACTIVE | `accept_offer` RPC (insert)                                      |
| ACTIVE             | PAID   | `record_payment` RPC, when `computeLedger(...).outstanding <= 0` |

`isOverdue = (status = 'ACTIVE') and (current_date > due_date) and (outstanding > 0)` — recomputed at read time, never stored, unchanged principle from Part A.

---

## 6. Privacy Behavior (finalized, confirms Part A §4 unchanged)

- Every profile read outside of "own profile" goes through `get_profile_visible(target_id)`.
- "Participant" = currently or ever linked via any `loan_requests` or `loans` row in either direction. This is intentionally permanent (not "only while a request/loan is active") — once you've negotiated with someone, they retain the access level you granted, matching how a real repayment history relationship works; there's no natural "un-participant" event in V1 (no request/loan deletion).
- Avatar `everyone` is the only field that can go fully public; email and phone can never be broader than `participants` — matches your original spec's asymmetry (no "everyone" option was offered for email/phone in Part A, preserved here).

---

## 7. Keeping the TS Engine and SQL RPC in Sync — FINALIZED: Option (A)

**Decision locked: PostgreSQL/PL/pgSQL is the sole authoritative source for every financial calculation and payment allocation.** No TypeScript-calculated financial value is ever trusted by the database, under any code path, at any layer.

Division of responsibility:

| Concern Owner Trust level                                                                            |                                                                                            |                                                                                                              |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Accrued interest, interest/principal/overpaid split, outstanding balance, `ACTIVE → PAID` transition | PL/pgSQL, inside `record_payment` (and a read-only `get_loan_ledger` function for display) | **Authoritative.** Only value ever written or relied upon for state.                                         |
| Live "what would my payment do" preview on the loan-detail page before submit                        | `lib/interest/engine.ts` (TypeScript)                                                      | **Advisory only.** Purely a UX preview; discarded on submit, never sent to the RPC as a value to be trusted. |
| Historical ledger display (already-recorded payments, already-computed components)                   | Rendered directly from the `payments`/`loans` columns the RPC wrote                        | Authoritative (it's just reading back what PL/pgSQL already computed and stored)                             |
| Unit testing, developer ergonomics                                                                   | TypeScript engine, run in Vitest with no DB dependency                                     | N/A — testing tool, not a runtime dependency of any financial path                                           |

Concretely, this means:

- `record_payment(loan_id, amount, payment_date, note)` — the client passes **only** `amount`, `payment_date`, `note`. It does **not** pass `interest_component`, `principal_component`, or any computed outstanding figure. Any such fields, if present in a request payload, are ignored server-side (the RPC signature simply doesn't accept them — there is nothing to ignore-vs-trust by construction).
- The RPC internally calls a PL/pgSQL function `compute_loan_ledger(loan_id, as_of date)` (the authoritative twin of §1.6's `computeLedger`) to derive `unpaidInterest` and `principal` as of `payment_date`, computes the three components itself, and only then inserts the `payments` row and evaluates the `PAID` transition.
- A read-only `get_loan_ledger(loan_id)` PL/pgSQL function (same core logic as `compute_loan_ledger`, but callable directly by authenticated participants for display, `SECURITY DEFINER` with the same participant check as the `loans_select` RLS policy) backs the loan-detail page's ledger table and the dashboard's outstanding totals — so even *read* paths never reconstruct financial figures in TypeScript from raw rows; they call the DB function and display what it returns.
- `lib/interest/engine.ts` remains structurally identical to §1.2/§1.3/§1.6 (it's the reference implementation those pseudocode blocks describe), but it is called from Server/Client Components purely to render a live preview *before* the user submits a payment ("if you pay ₹X today, \~₹Y goes to interest, \~₹Z to principal") — a UI convenience with zero authority. The number that actually lands in the ledger always comes back from the RPC response, and the UI reconciles/replaces the preview with that authoritative response once the call returns.

### 7.1 Shared golden fixtures (keeping TS and PL/pgSQL mathematically identical)

Both implementations exist to compute the *same* function; drift between them would surface as "the preview says one thing, the receipt says another" — confusing but not a security issue (since only the DB value is ever trusted), so this is purely a correctness/UX concern, not a security one. Managed via:

- `supabase/tests/fixtures/interest_golden_cases.json` — a single fixture file, checked into the repo, containing named cases: input (`principal`, `interest_type`, `interest_rate`, `interest_frequency`, `compounding`, `start_date`, `as_of`, `payments[]`) → expected output (`accrued_interest`, `outstanding`, `interest_component`/`principal_component`/`overpaid_excess` per payment, final `status`).
- **Consumed by both suites:** 
  - `lib/interest/engine.test.ts` (Vitest) loads the JSON and asserts the TS engine's output against every case.
  - `supabase/tests/interest_golden.sql` (pgTAP, run via `supabase test db`) loads the same JSON (via a `COPY`/`jsonb` fixture-loading helper or a generated `.sql` companion produced by a small build-time script that converts the JSON into `SELECT`/`VALUES` rows) and asserts `compute_loan_ledger`'s output against the identical cases.
- CI runs both suites on every PR; a PR that changes the accrual formula in one implementation without updating the fixture-matching output in the other fails CI — this is the actual mechanism enforcing "remain mathematically identical," not a documentation promise.
- The worked compound-interest example in §1.3 (₹100,000, 12%/yearly rate, monthly compounding, 6 months → ₹6,152.02) is fixture case #1 by convention, since it's already hand-verified in this document.

No conflict with the existing architecture was found in adopting this — it's a direct, stricter application of Part A §1.2's "server-authoritative money math" principle, not a change to it.

---

## 8. Testing Requirements

### 8.1 Interest engine (unit, both TS and PL/pgSQL implementations against shared fixtures)

- Simple interest: daily/monthly/yearly, exact and fractional periods.
- Compound interest: the worked example in §1.3 as a golden fixture, plus a case where `interest_frequency ≠ compounding`.
- Zero-interest loans.
- Accrual continuing correctly past `due_date` with no penalty jump.
- Reducing-balance behavior: two partial payments at different dates, verify interest recalculates on the reduced principal after each.
- Interest-first allocation: a payment smaller than accrued interest (principal\_component = 0); a payment larger than principal+interest (overpaid\_excess > 0).
- Payoff freeze: accrual does not continue past `paid_off_date`.

### 8.2 State machine / RLS (integration, local Supabase)

- Every illegal transition in §5 rejected.
- Concurrent `accept_offer` calls on the same request: exactly one succeeds (simulate two parallel transactions).
- Cross-user access denial on every table for every CRUD verb not explicitly granted.
- `update_username` allows exactly one change after the mandatory first pick, rejects a second.
- Username uniqueness race: two concurrent `update_username` calls to the same target username — exactly one succeeds.

### 8.3 Privacy

- `get_profile_visible` returns `null` for each sensitive field under each of its visibility settings, for a non-participant viewer, a participant viewer, and the owner.
- No test or code path ever calls `select * from profiles` for another user.

### 8.4 Notifications / reminders

- `dispatch_deadline_reminders` run twice on the same day for the same loan produces exactly one `deadline_reminder`/`overdue` row per type (idempotency).
- Reminders stop being generated once a loan reaches `PAID`.
- Realtime: a client subscribed to `notifications` for user A does not receive inserts for user B (RLS applies to Realtime too — verify explicitly, this is a common Supabase footgun).

### 8.5 E2E happy path (Playwright)

OAuth (mocked) → complete-profile (mandatory first username pick, not counted) → create request → counter → accept → two partial payments (verify ledger allocation display) → full payoff → verify `PAID`, `fully_paid` notifications, and that reminders no longer fire.

---

## 9. Implementation Phases (for Part C, when you're ready to build)

1. **Phase 0 — Foundation:** Supabase project (local + staging), all 17 migrations, RLS smoke tests, Google OAuth wiring, `/auth/login` → `/auth/callback` → `/complete-profile` flow.
2. **Phase 1 — Identity & Privacy:** profile completion, username RPC, privacy settings page, `get_profile_visible`, user search.
3. **Phase 2 — Negotiation:** request creation, offer/counter-offer flow, negotiation timeline UI, decline/cancel.
4. **Phase 3 — Loan Core:** `accept_offer` wired end-to-end, loan detail page (terms, no payments yet), `/lent` and `/borrowed` lists.
5. **Phase 4 — Interest Engine:** TS module + PL/pgSQL twin, unit test suite from §8.1, live accrual preview on loan detail.
6. **Phase 5 — Payments:** `record_payment`, ledger table UI (interest/principal columns), payoff flow, dashboard aggregates.
7. **Phase 6 — Notifications:** domain-event triggers, Realtime subscription + notification center UI, `pg_cron` reminder job.
8. **Phase 7 — Polish:** light/dark/system theme, empty states, E2E suite, deployment to staging then production per Part A §11.

Each phase should ship with its own tests before the next begins — particularly Phase 4, since Phases 5–8 all depend on the ledger math being right.

---

# PART C — IMPLEMENTATION PLAN (WITH FINAL CORRECTION OVERRIDES)

# FINAL CORRECTION OVERRIDES FOR PART C

The following points supersede the earlier draft wording inside Part C.

1. Final migration numbering:
   - 0011 = get_profile_visible
   - 0012 = update_username
   - 0013 = search_users
   - 0014 = accept_offer
   - 0015 = compute_and_get_loan_ledger / get_loan_ledger
   - 0016 = record_payment
   - 0017 = notification domain-event triggers
   - 0018 = deadline reminder cron

2. Final phase assignment:
   - Phase 0: 0001-0010
   - Phase 1: 0011-0013
   - Phase 2: no migration
   - Phase 3: 0014
   - Phase 4: 0015
   - Phase 5: 0016
   - Phase 6: 0017-0018
   - Phase 7: no migration
   - Phase 8: no migration

3. The authoritative financial dependency is 0015 -> 0016:
   `record_payment` depends on `compute_loan_ledger` / `get_loan_ledger`.

4. The earlier draft that placed the ledger functions at 0018 and record_payment at 0013 is superseded.

5. Phase 0 must not be interpreted as implementing all later-phase functionality at once. Later migrations are introduced in their assigned phases, while the final migration sequence remains strictly numeric.

6. Product decisions locked after the architecture review:
   - Google OAuth only for V1; no OTP/mobile-password auth.
   - Supabase Auth + PostgreSQL + RLS.
   - Username is the primary public identifier and can be changed once after the initial required username selection.
   - Separate Lent and Borrowed pages.
   - Privacy settings for avatar/profile picture, phone number, and email.
   - Interest choices include No Interest, Simple Interest, and Compound Interest.
   - A repayment deadline is REQUIRED in V1. Do not add a "No deadline" option.
   - No-interest and deadline validation must be reflected consistently in UI, types, database constraints, RPCs, tests, and notifications.
   - Light, dark, and system theme are required.
   - Old Mini Bank code is reference material only; Monly is a greenfield build.


# P2P Lending & Debt-Tracking Platform — Implementation Plan (Part C)

> Still a specification, not code. This is the build plan Codex (or any implementer) follows to actually write the application, phase by phase, against the locked Part A + Part B decisions.

**Conflict check against existing architecture/decisions:** none found. Everything below is sequencing, file layout, and setup mechanics for what Parts A and B already specified — no new technical decisions were required.

---

## 1. Exact Build Order

Eight phases, each independently shippable and testable before the next starts. Phase 4 (interest engine, PL/pgSQL-authoritative per Part B §7) is the critical path — nothing in Phases 5–8 can be correctly built or tested against real numbers until it's done and its golden fixtures pass in both languages.

```
Phase 0  Foundation           -> 0001-0010, Supabase project, OAuth wiring, empty shell app
Phase 1  Identity & Privacy   -> 0011-0013, profile completion, username RPC, privacy settings, search
Phase 2  Negotiation          -> no migration; requests/offers/counter-offers are handled through the Phase 1/3 schema + RLS
Phase 3  Loan Core            -> 0014, accept_offer wired end-to-end, loan detail (terms only), /lent /borrowed lists
Phase 4  Interest Engine      -> 0015, PL/pgSQL authoritative ledger fns + TS preview twin + golden fixtures (BLOCKING)
Phase 5  Payments             -> 0016, record_payment wired end-to-end, ledger UI, payoff flow, dashboard aggregates
Phase 6  Notifications        -> 0017-0018, domain-event triggers, Realtime, notification center, pg_cron reminders
Phase 7  Theming & Polish     -> no migration; light/dark/system, empty/error states, a11y pass
Phase 8  Hardening & Deploy   -> no migration; full E2E suite, RLS adversarial tests, staging -> production rollout

```

Within each phase, the sub-order is always: **migration(s) -> RPC/DB function -> typed data-access helper (****`lib/`****) -> Server Action -> Server Component page -> Client Component interactivity -> tests.** This keeps every layer buildable against a real (local) database instead of mocked data, per the "do not fake backend functionality with hard-coded data" constraint from Part A.

---

## 2. Files to Create (full tree, annotated by phase)

```
supabase/
  config.toml                                    [Phase 0]
  migrations/
    0001_enums.sql                                [0]
    0002_tables_profiles_privacy.sql              [0]
    0003_tables_requests_offers.sql               [0]
    0004_tables_loans_payments.sql                [0]
    0005_tables_notifications.sql                 [0]
    0006_triggers_profile_bootstrap.sql           [0]
    0007_triggers_updated_at.sql                  [0]
    0008_rls_profiles_privacy.sql                 [0]
    0009_rls_requests_offers.sql                  [0]
    0010_rls_loans_payments_notifications.sql     [0]
    0011_fn_get_profile_visible.sql               [1]
    0014_fn_accept_offer.sql                      [3]
    0015_fn_compute_and_get_loan_ledger.sql       [4]
    0016_fn_record_payment.sql                    [5]
    0012_fn_update_username.sql                   [1]
    0013_fn_search_users.sql                      [1]
    0017_triggers_notifications_on_domain_events.sql [6]
    0018_cron_deadline_reminders.sql              [6]
  seed.sql                                        [0]  -- dev-only fixtures, two demo users, one demo loan
  tests/
    fixtures/interest_golden_cases.json           [4]
    interest_golden.sql                           [4]  -- pgTAP, consumes the JSON fixture
    rls_profiles.test.sql                          [1]
    rls_requests_offers.test.sql                   [2]
    rls_loans_payments.test.sql                    [3/4]
    state_machine_requests.test.sql                [2]
    state_machine_offers.test.sql                  [2]
    accept_offer_concurrency.test.sql              [3]
    record_payment_ledger.test.sql                 [4/5]
    username_change_limit.test.sql                 [1]
    reminder_idempotency.test.sql                  [6]

middleware.ts                                     [0]

app/
  layout.tsx                                      [0]
  globals.css                                      [0]
  page.tsx                                          [0]  -- marketing/landing, redirects authed users to /dashboard
  auth/
    login/page.tsx                                 [0]
    callback/route.ts                               [0]
  complete-profile/
    page.tsx                                        [1]
  (app)/
    layout.tsx                                       [0]  -- authed shell: nav, theme provider, notification bell
    dashboard/page.tsx                               [3, aggregates finished in 5]
    lent/page.tsx                                    [3]
    borrowed/page.tsx                                [3]
    requests/page.tsx                                 [2]
    requests/[id]/page.tsx                             [2, accept action wired in 3]
    loans/[id]/page.tsx                                 [3, ledger table filled in 5]
    profile/page.tsx                                     [1]
    profile/settings/page.tsx                             [1]
    notifications/page.tsx                                 [6]

components/
  ui/
    button.tsx, card.tsx, badge.tsx, dialog.tsx,
    input.tsx, select.tsx, tabs.tsx, skeleton.tsx        [0, extended per-phase]
  theme/
    theme-provider.tsx, theme-toggle.tsx                  [7]
  users/
    user-search-combobox.tsx, user-avatar.tsx               [1]
  requests/
    request-list.tsx, request-card.tsx, new-request-dialog.tsx [2]
  negotiation/
    negotiation-timeline.tsx, offer-card.tsx, counter-offer-form.tsx [2]
  loans/
    loan-summary-card.tsx, loan-terms-panel.tsx               [3]
    loan-ledger-table.tsx, payment-form.tsx, payment-preview.tsx [4/5]
  notifications/
    notification-bell.tsx, notification-list.tsx                [6]

lib/
  supabase/
    client.ts, server.ts, middleware.ts                          [0]
  types/
    database.types.ts   -- generated via `supabase gen types typescript` [0, regenerated every migration]
  interest/
    engine.ts            -- TS preview twin, structurally mirrors Part B 1.2/1.3/1.6 [4]
    engine.test.ts        -- loads shared golden fixtures                     [4]
  loans/
    queries.ts, actions.ts                                                    [3, extended 5]
  offers/
    actions.ts                                                                 [2]
  requests/
    actions.ts                                                                 [2]
  payments/
    actions.ts                                                                 [5]
  privacy/
    visibility.ts        -- TS types mirroring get_profile_visible() shape     [1]
  users/
    search.ts                                                                  [1]
  notifications/
    subscribe.ts          -- Realtime hook                                     [6]

tests/
  e2e/
    happy-path.spec.ts                                                        [8]
    rls-adversarial.spec.ts (browser-level, two logged-in contexts)            [8]

.env.local.example                                                            [0]

```

---

## 3. Database Migration Order

The final authoritative migration numbering is:

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
0017_triggers_notifications_on_domain_events.sql
0018_cron_deadline_reminders.sql
```

Phase assignment:

```text
Phase 0 -> 0001-0010
Phase 1 -> 0011-0013
Phase 2 -> no migration
Phase 3 -> 0014
Phase 4 -> 0015
Phase 5 -> 0016
Phase 6 -> 0017-0018
Phase 7 -> no migration
Phase 8 -> no migration
```

Technical dependencies are separated from phase assignment:

```text
0001
  -> 0002 -> 0003 -> 0004 -> 0005
       -> 0006 / 0007
            -> 0008-0010
                 -> 0011
                 -> 0012
                 -> 0013
                 -> 0014
                      -> 0015
                           -> 0016
                 -> 0017
                      -> 0018
```

The important financial dependency is:

```text
0015 compute_loan_ledger / get_loan_ledger
        ↓
0016 record_payment
```

Migrations are created and applied in strict numeric order. The numeric prefixes are load-bearing. Never renumber or squash an already-applied migration once the real repository has been initialized and deployed.

Phase 0 does NOT mean that all later-phase migrations are conceptually implemented in Phase 0. Each later-phase migration is introduced and tested in its assigned phase, while the repository's final migration history remains strictly ordered.

`pg_cron` is enabled in the notification/reminder migration (`0018`) as specified by the final architecture, with the extension creation guarded by `IF NOT EXISTS`.

---

## 4. Supabase Setup

1. Create two Supabase projects via the dashboard: `<project>-staging` and `<project>-production`. (Local dev uses the CLI's Dockerized instance, not a third hosted project.)
2. Install the Supabase CLI locally; `supabase init` at repo root (creates `supabase/config.toml` if not already committed).
3. `supabase login`, then `supabase link --project-ref <staging-ref>` for the staging remote (production linked separately in CI, not from a developer machine, per Part A Section 11).
4. `supabase start` boots the local Docker stack (Postgres, Auth, Realtime, Storage — Storage unused in V1 but ships with the stack).
5. Apply all migrations locally: `supabase db reset` (runs every migration in `supabase/migrations/` against the fresh local DB, then `seed.sql`).
6. `supabase gen types typescript --local > lib/types/database.types.ts` — regenerate after every new/changed migration; this file is committed (not gitignored) so CI and reviewers can see schema-shape diffs in PRs.
7. In the Supabase dashboard for staging/production: Authentication -> Providers -> enable **Google only**; disable Email/Password and Phone providers explicitly (they're on by default on a new project — this step is easy to miss and directly contradicts "Google OAuth only" if skipped).
8. Authentication -> URL Configuration: set **Site URL** and **Redirect URLs** to match each environment's domain (`http://localhost:3000/auth/callback` for local, the Vercel preview/staging URL, and the production domain).
9. Database -> Extensions: confirm `pg_cron` and `pgcrypto` (for `gen_random_uuid()`) are enabled on staging/production (both are pre-available on Supabase but `pg_cron` needs explicit enabling — see Section 3).

---

## 5. Google OAuth Setup

1. In Google Cloud Console, create (or reuse) a project; enable the **Google Identity / OAuth consent screen** (External user type, since this is a public consumer app).
2. Consent screen: app name, support email, scopes limited to default (`email`, `profile`, `openid` — no extra Google scopes are needed since nothing else about the user's Google account is used).
3. Credentials -> Create OAuth Client ID -> **Web application**.
4. Authorized redirect URIs — one entry **per Supabase project**, pointing at that project's Supabase Auth callback (not your app's `/auth/callback`): 
   ```
   https://<staging-project-ref>.supabase.co/auth/v1/callbackhttps://<production-project-ref>.supabase.co/auth/v1/callback

   ```
   (Local dev reuses the staging Google client with `http://127.0.0.1:54321/auth/v1/callback` added, or a separate dev-only Google client if you prefer stricter separation.)
5. Copy the generated **Client ID** and **Client Secret** into each Supabase project's dashboard: Authentication -> Providers -> Google.
6. Your app's own `/auth/callback` (a Next.js Route Handler) is what Supabase redirects *your users* to after it finishes the Google exchange — that's a separate, app-side redirect URL configured in step 8 of Section 4, not the Google Cloud redirect URI in this section. Don't conflate the two; this is the single most common Supabase+Google OAuth misconfiguration.
7. Verify end-to-end locally against `supabase start`'s local Auth service before touching staging — the local stack proxies to the real Google OAuth consent screen but exchanges the code against your local Postgres, so this is a genuine test of the flow, not a mock.

---

## 6. Environment Variables (finalized)

```
# .env.local (git-ignored) — same variable NAMES across local/staging/production,
# values differ per environment via Vercel's per-environment env var scoping.

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=                # e.g. http://localhost:3000 / https://staging.<domain> / https://<domain>

# Server-only — never prefixed NEXT_PUBLIC_, never in a client bundle
SUPABASE_SERVICE_ROLE_KEY=           # only needed if any admin-context script/cron uses it outside pg_cron itself;
                                       # pg_cron runs inside Postgres and does NOT need this key at all

```

`.env.local.example` (committed, no real values) documents exactly these four variables and nothing else — no payment gateway, SMS, or email provider keys exist anywhere in this project, consistent with Part A Section 12. Google Client ID/Secret are **not** app env vars — they live only in the Supabase dashboard (Section 5, step 5), never in `.env.local` or Vercel.

---

## 7. Component Architecture

Default to **Server Components**; a component becomes a Client Component only when it needs interactivity, browser APIs, or a Realtime subscription. Rough tree (props summarized, not exhaustive):

```
app/(app)/layout.tsx                 [Server] fetches current profile once, provides to nav
  -> <ThemeProvider>                 [Client] wraps next-themes, no props beyond children
  -> <AppNav>                        [Server] renders links + <NotificationBell/>
       -> <NotificationBell/>        [Client] Realtime-subscribed unread count badge

app/(app)/requests/[id]/page.tsx     [Server] fetches request + offers via lib/loans/queries.ts
  -> <NegotiationTimeline offers/>   [Server] pure render of immutable offer history
  -> <CounterOfferForm requestId/>   [Client] form state, calls counterOffer Server Action
  -> <AcceptOfferButton offerId/>    [Client] confirm dialog, calls acceptOffer Server Action

app/(app)/loans/[id]/page.tsx        [Server] fetches loan via get_loan_ledger RPC (authoritative)
  -> <LoanTermsPanel/>               [Server] static display of copied terms
  -> <LoanLedgerTable rows/>         [Server] renders authoritative per-payment allocation
  -> <PaymentForm loanId/>           [Client] amount/date inputs
       -> <PaymentPreview/>          [Client] calls lib/interest/engine.ts locally for the
                                       "estimated allocation" preview only (Part B Section 7) —
                                       clearly labeled "estimate" in the UI, replaced by the
                                       RPC's authoritative response after submit

app/(app)/profile/settings/page.tsx  [Server] fetches own profile + privacy_settings
  -> <PrivacySettingsForm/>          [Client] toggles, calls updatePrivacySettings action
  -> <UsernameChangeForm/>           [Client] disabled/read-only if username_changed_count = 1
                                       and this isn't the first mandatory pick

```

Rules:

- No Client Component ever calls Supabase directly for a mutation that has a corresponding Server Action — always go through the Server Action so validation (zod) and the RPC call happen server-side, per Part A Section 5/9.
- Any component displaying `avatar_url`/`email`/`phone_number` for another user receives already-filtered data (from `get_profile_visible`) as props — it never receives a raw profile row and never decides visibility itself, per Part A Section 4.1/Part B Section 6.

---

## 8. UI / Page Architecture

| Route Type Data source Notes  |                                  |                                                                                                     |                                                                                                      |
| ----------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/`                           | Server                           | none (public)                                                                                       | Redirects to `/dashboard` if session exists                                                          |
| `/auth/login`                 | Client                           | Supabase `signInWithOAuth`                                                                          | Single "Continue with Google" button                                                                 |
| `/auth/callback`              | Route Handler                    | `exchangeCodeForSession`                                                                            | Redirects to `/complete-profile` or `/dashboard` based on `username_changed_count`/placeholder check |
| `/complete-profile`           | Client form -> Server Action     | `update_username` RPC                                                                               | Blocks until a valid, unique username is set                                                         |
| `/dashboard`                  | Server                           | aggregates over `loans`/`payments` (via `get_loan_ledger` per loan, summed)                         | Money Lent/Borrowed, Outstanding, Active/Pending/Overdue counts, recent activity feed                |
| `/lent`                       | Server                           | `loans where lender_id = me`, sectioned Active/Overdue/Completed using derived `isOverdue`/`status` |                                                                                                      |
| `/borrowed`                   | Server                           | same, `borrower_id = me`                                                                            |                                                                                                      |
| `/requests`                   | Server                           | `loan_requests` where participant, tabs for sent/received                                           |                                                                                                      |
| `/requests/[id]`              | Server + Client islands          | request + all offers (RLS-scoped)                                                                   | Negotiation timeline, counter/accept/decline actions                                                 |
| `/loans/[id]`                 | Server + Client islands          | `get_loan_ledger` RPC                                                                               | Terms, ledger table, payment form                                                                    |
| `/profile`                    | Server                           | own profile (direct, since it's always "own" — `get_profile_visible` not needed for self)           | Read-only summary + link to settings                                                                 |
| `/profile/settings`           | Client forms                     | `privacy_settings`, `profiles`                                                                      | Privacy toggles, username change                                                                     |
| `/notifications`              | Server initial + Client Realtime | `notifications` where `user_id = me`                                                                | Mark-as-read, deep-links into the referenced request/loan                                            |

Loading/error states: every data-fetching Server Component page ships a sibling `loading.tsx` (skeleton matching the page's card layout) and relies on the nearest `error.tsx` boundary for RLS/auth failures (e.g., navigating to a `loans/[id]` you're not a participant in should render a clean "not found or not authorized" rather than leaking a raw Postgres error).

---

## 9. Testing Order

Tests are written **alongside** the phase that introduces the thing being tested, not deferred to the end — but the *order in which test suites first go green* is:

1. **Phase 0:** migration apply/reset succeeds locally and in CI (`supabase db reset` exit code), RLS enabled on all seven tables (a single meta-test asserting `relrowsecurity = true` for every table — catches "forgot to enable RLS on a new table" permanently).
2. **Phase 1:** `username_change_limit.test.sql`, `rls_profiles.test.sql`, profile-visibility unit tests for `get_profile_visible` (all three visibility settings times three viewer relationships).
3. **Phase 2:** `state_machine_requests.test.sql`, `state_machine_offers.test.sql`, `rls_requests_offers.test.sql` (cross-user access denial).
4. **Phase 3:** `accept_offer_concurrency.test.sql` (the two-parallel-transaction race test), `rls_loans_payments.test.sql` (read-only at this point, since payments don't exist yet).
5. **Phase 4 (gate before Phase 5 starts):** `lib/interest/engine.test.ts` and `interest_golden.sql` both green against `fixtures/interest_golden_cases.json`, including the compound-interest worked example and the reducing-balance/interest-first cases from Part B Section 8.1. **This phase does not "pass" until both language implementations agree on every fixture — treat a mismatch as a build blocker, not a follow-up ticket.**
6. **Phase 5:** `record_payment_ledger.test.sql` (component allocation, overpayment, payoff transition), dashboard aggregate correctness against seeded fixtures.
7. **Phase 6:** `reminder_idempotency.test.sql`, Realtime cross-user isolation test (Part B Section 8.4).
8. **Phase 7:** visual/theme snapshot tests (light/dark) on dashboard, loan detail, negotiation timeline.
9. **Phase 8:** `tests/e2e/happy-path.spec.ts` (full OAuth-mocked flow), `tests/e2e/rls-adversarial.spec.ts` (two real logged-in browser contexts, user B attempts to view/mutate user A's request/loan/payment and is denied at the UI level too, not just the API level).

CI runs the full suite (SQL + Vitest + Playwright) on every PR against a fresh local Supabase instance spun up in the CI job — never against staging, to keep tests hermetic and repeatable.

---

## 10. Local Development Commands

```
# One-time setup
npm install
supabase login
supabase link --project-ref <staging-ref>

# Daily loop
supabase start                        # boot local Postgres/Auth/Realtime
supabase db reset                     # apply all migrations + seed.sql fresh
supabase gen types typescript --local > lib/types/database.types.ts
npm run dev                           # Next.js dev server, http://localhost:3000

# New migration
supabase migration new <name>         # creates supabase/migrations/<timestamp>_<name>.sql
supabase db reset                     # re-apply to verify locally before committing

# Testing
npm run test                          # Vitest (lib/interest/engine.test.ts, etc.)
supabase test db                      # pgTAP suite in supabase/tests/*.sql
npm run test:e2e                      # Playwright, against a locally running dev server + local Supabase

# Pushing schema changes to staging (CI-driven; documented here for local verification only)
supabase db push --project-ref <staging-ref>   # run in CI, not from a laptop, once merged

```

---

## 11. Deployment Process

1. **PR opened** -> CI: `supabase db reset` (fresh local instance) -> full test suite (Section 9) -> `next build` (type-check + build) -> Vercel preview deployment pointed at the **staging** Supabase project's URL/anon key (preview deploys share staging data; acceptable for a pre-launch V1, revisit if this becomes a problem post-launch).
2. **PR merged to** **`staging`** **branch** -> CI applies any new migrations to the staging Supabase project (`supabase db push --project-ref <staging-ref>`) **before** the corresponding Vercel deployment for the staging environment completes — migration-then-deploy ordering matters because a deployed app expecting a new column/RPC must never race ahead of the schema.
3. **Manual QA on staging** using the checklist implied by Section 12's acceptance criteria, run against real Google OAuth (not mocked) and the staging Supabase project.
4. **Merge** **`staging`** **->** **`main`** -> CI applies migrations to the **production** Supabase project, then triggers the production Vercel deployment, same ordering guarantee as step 2.
5. **Post-deploy smoke check:** login flow completes, `/dashboard` loads for a real account, `pg_cron` job listed as scheduled (`select * from cron.job;`) on the production database.
6. **Rollback plan:** Vercel deployments are trivially revertible (previous deployment promotion); database migrations are **not** trivially reversible by design (this app has no down-migrations authored, consistent with an additive, append-only-ledger domain model) — a bad migration is fixed forward with a new migration, never rolled back destructively against data that may already have payments/loans in it.

---

## 12. Acceptance Criteria per Phase

**Phase 0 — Foundation**

- [ ] All 18 migrations apply cleanly via `supabase db reset` with zero errors.
- [ ] RLS enabled (`relrowsecurity = true`) on all 7 tables.
- [ ] Google OAuth login completes locally, session cookie set, lands on `/complete-profile` for a first-time user.
- [ ] Email/password and phone providers confirmed **disabled** in every Supabase project (local, staging, production).

**Phase 1 — Identity & Privacy**

- [ ] First-time user cannot reach `/dashboard` without setting a real username.
- [ ] `update_username` rejects a second change (after the free first pick); unique-username collisions surface a friendly error, not a raw constraint error.
- [ ] `get_profile_visible` returns `null` for each sensitive field exactly per the owner's privacy settings, verified for non-participant, participant, and self.
- [ ] Search excludes the current user and returns only public columns.

**Phase 2 — Negotiation**

- [ ] Creating a request against yourself is rejected (DB-level, not just UI-disabled).
- [ ] Countering replaces the active offer atomically; the previous offer is visibly `SUPERSEDED`, never deleted, in the timeline UI.
- [ ] Declining/cancelling a request makes it terminal; further offers against it are rejected.
- [ ] A user who is not sender/receiver cannot see the request or its offers (verified via RLS test, not just UI routing).

**Phase 3 — Loan Core**

- [ ] Accepting an offer is atomic under concurrency: two simultaneous accept attempts on the same request result in exactly one loan.
- [ ] `loans.start_date` equals the acceptance date, never a negotiation timestamp; `due_date` equals the accepted offer's deadline.
- [ ] `/lent` and `/borrowed` correctly section loans by derived `isOverdue`/status, with zero stored "overdue" column anywhere.

**Phase 4 — Interest Engine (blocking gate)**

- [ ] Every golden fixture in `interest_golden_cases.json` passes identically in `engine.test.ts` (TS) and `interest_golden.sql` (PL/pgSQL) — byte-for-byte numeric agreement, not "close enough."
- [ ] The compound-interest worked example (Part B Section 1.3) is present as a fixture and passes.
- [ ] Reducing-balance behavior verified: interest recalculates correctly on post-payment principal in a multi-payment scenario.

**Phase 5 — Payments**

- [ ] `record_payment` accepts only `(loan_id, amount, payment_date, note)` — no allocation or balance field is client-suppliable, verified by inspecting the RPC signature/grants, not just by convention.
- [ ] Interest-first allocation is correct and matches `get_loan_ledger`'s stored, frozen historical components exactly.
- [ ] A loan flips to `PAID` with `paid_off_date` set the instant outstanding reaches zero, and stops accruing/reminding thereafter.
- [ ] Overpayment produces a non-zero `overpaid_excess` that is visibly surfaced in the ledger UI, not silently dropped.

**Phase 6 — Notifications**

- [ ] Every domain event in Part A Section 13/Part B Section 3.14 produces exactly one notification row to the correct recipient(s).
- [ ] `dispatch_deadline_reminders` run twice same-day is idempotent per loan per reminder type.
- [ ] A user's Realtime subscription never receives another user's notification (tested with two real logged-in browser contexts, not just an RLS unit test).

**Phase 7 — Theming & Polish**

- [ ] Every page renders correctly in light, dark, and system-following modes with no unstyled/default-browser elements.
- [ ] Every data-fetching page has a matching `loading.tsx` skeleton and a graceful `error.tsx` for unauthorized access.

**Phase 8 — Hardening & Deploy**

- [ ] Full E2E happy path passes against a fresh local Supabase instance in CI.
- [ ] Adversarial E2E (two real accounts) confirms user B cannot view or act on user A's private request/loan/payment/profile fields through the UI.
- [ ] Staging smoke-tested end-to-end with real Google OAuth before promotion to production.
- [ ] Production `pg_cron` job confirmed scheduled and firing (checked via `cron.job_run_details` after the first scheduled run).

---

# FINAL PRODUCT DECISIONS / HANDOFF NOTES

- Project name/working brand: **Monly** (Money + Friendly). The name can still be changed later.
- This is a **greenfield project**. Do not reuse the previous Mini Bank codebase as the production codebase.
- Previous Mini Bank code may be considered reference material only.
- V1 authentication: **Google OAuth through Supabase Auth only**. OTP/mobile-number authentication is out of scope for now.
- Users choose a unique username after first login. Username is the primary public identifier.
- Username can be changed once after the initial mandatory selection.
- Users search for other registered users by username.
- Both parties must already be registered before they can be selected as a counterparty.
- Separate first-class **Lent** and **Borrowed** sections are required.
- Profile privacy settings must control visibility of avatar/profile picture, phone number, and email according to the locked privacy architecture.
- Interest options: **No Interest, Simple Interest, Compound Interest**.
- **No Interest** is a real financial option, not a UI shortcut.
- A repayment **deadline is mandatory in V1**. Do not add a No Deadline option.
- PostgreSQL/PLpgSQL is authoritative for financial calculations and payment allocation.
- TypeScript financial logic is a preview/test twin only.
- Payment allocation is interest-first.
- Payments are append-only and historical offer rows are immutable.
- Request → Offer → Counter-offer → Accept/Decline → Loan → Payments → Paid is the core lifecycle.
- Light, dark, and system theme are required.
- In-app notifications + Supabase Realtime are V1 notification delivery.
- Deadline reminders are scheduled and idempotent.
- No payment gateway, wallet, SMS, or actual money movement is part of V1.

---

# MANUS UI/UX PROMPT

# MONLY — MANUS UI/UX DESIGN BRIEF

The attached master document contains the finalized technical architecture, implementation specification, corrected implementation plan, and product decisions for Monly.

Your role in this stage is to design the COMPLETE UI/UX, visual design system, information architecture, interaction design, responsive behavior, and visual prototype/reference.

You are NOT responsible for implementing the production backend and must NOT redesign the locked technical architecture.

Treat the attached master document as the single source of truth for:
- Next.js App Router
- Supabase Auth with Google OAuth only
- Supabase/PostgreSQL
- RLS and server-side privacy enforcement
- PostgreSQL/PLpgSQL as financial authority
- TypeScript interest engine as preview/test twin
- append-only payments ledger
- immutable negotiation offers
- request → offer → counter-offer → accept/decline → loan → payments → paid
- mandatory repayment deadline in V1
- No Interest / Simple / Compound interest
- separate Lent and Borrowed sections
- username-based user search
- privacy controls
- in-app notifications and Supabase Realtime
- pg_cron reminders
- light/dark/system themes

Do not invent a different backend, database, authentication system, financial model, or security model.

## PRODUCT

Monly is a friendly peer-to-peer lending and debt-tracking application for people who already know each other.

Example:
Rajarshi lends ₹100 to Ankit.

Either person can initiate a request:
- Rajarshi can send a lending request.
- Ankit can send a borrowing request.

The request proposes:
- amount
- interest terms
- deadline
- note/message

The recipient can:
- Accept
- Decline
- Counter-offer

A counter-offer creates a new historical offer rather than overwriting the previous one.

## INTEREST

Support:
1. No Interest
2. Simple Interest
3. Compound Interest

No Interest must be a first-class UI option. When selected, rate/frequency/compounding controls are disabled/hidden and the UI clearly states that no interest accrues.

A repayment deadline is mandatory in V1.

## MAIN NAVIGATION

- Dashboard
- Lent
- Borrowed
- Requests
- Notifications
- Profile

Lent = money other people owe the current user.

Borrowed = money the current user owes other people.

## DASHBOARD

Design a modern personal-finance dashboard showing:
- total lent
- total borrowed
- outstanding amounts
- active loans
- upcoming deadlines
- overdue loans
- recent activity

It should feel personal and friendly, not like a corporate banking admin panel.

## LENT / BORROWED

Design dedicated first-class pages.

Loan cards should show:
- participant name
- avatar when permitted
- original amount
- current outstanding amount
- interest terms
- deadline
- status
- relevant action

Statuses include:
- Active
- Partially Paid
- Overdue
- Paid

## REQUESTS

Separate:
- Incoming
- Outgoing

Incoming:
- sender
- amount
- interest
- deadline
- message
- current offer
- Accept / Decline / Counter

Outgoing:
- recipient
- current offer
- status
- negotiation history
- cancel where technically allowed

## NEGOTIATION TIMELINE

Make this one of the strongest screens.

Example:

Rajarshi
₹10,000
5% monthly
30 Sep
↓
Ankit countered
₹8,000
3% monthly
15 Oct
↓
Rajarshi countered
₹9,000
3% monthly
20 Oct
↓
Ankit accepted

Clearly differentiate:
- your offers
- their offers
- active offer
- superseded offers
- accepted offer
- declined offers

It should feel like a modern negotiation/messaging experience rather than a generic form.

## LOAN DETAIL

Include:
- both participants
- original principal
- current outstanding
- interest terms
- deadline
- status
- payment history
- negotiation history
- important dates

Payment history should show:
- payment amount
- interest portion
- principal portion
- date
- overpaid excess where applicable

## PAYMENT FLOW

Before confirmation show:
- current outstanding
- payment amount
- estimated interest allocation
- principal allocation
- remaining outstanding

The UI must not imply that client-side calculations are authoritative; the production backend is authoritative.

## PROFILE

Show:
- avatar
- name
- username
- email
- mobile number if present

Username is the primary public identifier, e.g. @ankit.

Username can be changed once after registration.

## PRIVACY

Allow control over:
- profile picture/avatar
- mobile number
- email

Use clear visibility choices:
- Everyone
- Participants
- Nobody

Explain "Participants" clearly.

## AUTH / ONBOARDING

Google OAuth through Supabase Auth.

No OTP.

Flow:
Landing/Login
→ Continue with Google
→ first-time user
→ choose username
→ profile setup
→ dashboard

Returning user:
Google
→ dashboard

## NOTIFICATIONS

Design in-app notifications for:
- new request
- counter-offer
- offer accepted
- offer declined
- payment recorded
- deadline reminder
- overdue
- fully paid

Keep notifications useful and non-spammy.

## VISUAL DIRECTION

Create a distinctive identity:
- friendly fintech
- modern personal finance
- social/trust-oriented
- premium but approachable

Do NOT make it:
- a generic bank dashboard
- a Stripe clone
- a Revolut clone
- a generic Tailwind template
- corporate accounting software

Use:
- generous whitespace
- refined cards
- subtle borders
- strong typography hierarchy
- restrained motion
- tasteful micro-interactions

Avoid excessive gradients, excessive glassmorphism, neon-heavy styling, and flashy animations.

## LIGHT / DARK / SYSTEM

Design all three modes deliberately:
- Light
- Dark
- System

Do not simply invert colors.

Maintain:
- contrast
- readable financial numbers
- clear surfaces/borders
- accessible status indicators
- consistent hierarchy

## COLOR PALETTE

Propose 2–3 possible directions first.

For each include:
- primary
- secondary
- accent
- background
- surface
- text
- muted text
- success
- warning
- danger
- info

Then recommend ONE final palette for Monly.

## TYPOGRAPHY

Recommend:
- primary font
- optional heading font
- body font
- financial/numeric treatment

Financial values such as ₹12,450.00 should be prominent but refined.

## RESPONSIVE DESIGN

Design for:
- desktop
- tablet
- mobile

Mobile is critical.

Consider:
- desktop sidebar
- mobile bottom navigation/compact navigation
- mobile-friendly loan cards
- negotiation timeline that works on narrow screens

## COMPONENT SYSTEM

Define reusable components such as:
- Button
- Input
- Select
- AmountInput
- InterestSelector
- DeadlineSelector
- UserAvatar
- UserSearch
- UserCard
- LoanCard
- LoanSummary
- StatusBadge
- OfferCard
- OfferTimeline
- CounterOfferForm
- PaymentForm
- PaymentHistory
- NotificationItem
- DashboardSummary
- EmptyState
- LoadingState
- ErrorState
- Modal
- ConfirmationDialog
- Toast

Explain important variants and states.

## MICRO-INTERACTIONS

Use restrained animations for:
- page transitions
- cards appearing
- request acceptance
- counter-offer creation
- payment confirmation
- status changes
- notification arrival
- number updates

The application should feel stable and trustworthy.

## EMPTY / LOADING / ERROR

Design these explicitly.

Examples:
- "You haven't lent anyone money yet."
- "You don't owe anyone right now."
- "You're all caught up."
- "Nothing new."

Provide skeletons and meaningful errors.

## ACCESSIBILITY

Include:
- strong contrast
- keyboard navigation
- visible focus
- accessible labels
- clear errors
- status not communicated by color alone
- touch-friendly controls

## DELIVERABLE

Produce a COMPLETE UI/UX DESIGN SPECIFICATION for Monly:

1. product design philosophy
2. information architecture
3. navigation architecture
4. page list
5. user flows
6. dashboard
7. Lent
8. Borrowed
9. Requests
10. negotiation interface
11. loan detail
12. payment flow
13. profile
14. privacy settings
15. notifications
16. authentication/onboarding
17. light theme
18. dark theme
19. color palette options
20. final recommended palette
21. typography
22. component library
23. responsive behavior
24. accessibility
25. micro-interactions
26. empty/loading/error states
27. design tokens
28. screen-by-screen descriptions
29. desktop/mobile behavior
30. implementation notes for Codex

If your environment supports creating a visual prototype/mockup, create it as a DESIGN REFERENCE ONLY. Do not replace or redesign the locked backend architecture.

The eventual production implementation will be built separately by Codex from the combined technical specification and your UI/UX specification.


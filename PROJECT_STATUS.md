# FLENDLY (MONLY) — PROJECT STATUS & HANDOVER DOCUMENTATION

## 1. Overview
Flendly is a peer-to-peer lending and debt-tracking platform for informal loans between trusted friends and family. It features a complete request → offer / counter-offer → acceptance → loan creation → interest-first payment allocation → payoff workflow.

## 2. Tech Stack & Environment
- **Framework:** Next.js 16.3.0 (App Router, Turbopack)
- **Frontend:** React 19, Tailwind CSS v4, TypeScript 5
- **Backend:** Supabase (PostgreSQL, Supabase Auth, RLS)
- **Math & Validation:** Decimal.js, Zod
- **Testing:** Vitest
- **Target Supabase URL:** `https://xlpezxdbdjuzfqyiuxgh.supabase.co`

---

## 3. Implemented Features & Architecture

### Authentication & Session Management
- **Google OAuth + Callback:** Handled via `@supabase/ssr` in `src/app/auth/login` and `src/app/auth/callback`.
- **Middleware / Proxy:** Configured in `src/middleware.ts` and `proxy.ts` using `updateSession`. Refreshing sessions, protecting routes (`/dashboard`, `/lent`, `/borrowed`, `/requests`, `/loans`, `/profile`, `/notifications`), and routing users with uncompleted profiles to `/complete-profile`.
- **Profile Completion Flow:** `/complete-profile` collects both **Full Name** and **Username** (`@username`). `isPlaceholderUsername()` returns `true` for missing profiles or placeholder usernames (`^user_[0-9a-f]{8}$`).
- **Resilient Fallback Upserts:** `src/lib/users/actions.ts` handles standard RPCs (`update_username`, `update_profile_details`) and includes automatic fallback to direct `.from("profiles").upsert(...)` and `.from("profiles").update(...)` if PostgREST schema cache hasn't indexed the functions yet.

### Core Lending & Negotiation Workflow
- **Create Request:** User A creates a request specifying lender/borrower role, amount, interest terms, repay-by deadline, and optional message (`src/lib/requests/actions.ts`).
- **Negotiation:** User B receives incoming request. Can **Accept**, **Counter** (creates a new active offer & marks previous offer superseded), **Decline**, or **Cancel** (if sender).
- **Loan Creation:** Accepting an offer invokes `accept_offer` SQL RPC which atomically creates the active loan in `public.loans` and marks the request `ACCEPTED`.

### Interest Calculation & Ledger Engine
- **Dual Twin Engine:**
  - Authoritative Database Twin: `supabase/migrations/0015_fn_loan_ledger.sql` (`compute_loan_ledger`, `record_payment`).
  - Client Advisory Twin: `src/lib/interest/engine.ts` (`computeLedger`, `previewPayment`).
- **Interest Mechanics:** Supports Simple and Compound interest across Daily, Monthly, and Yearly calendar frequencies.
- **Payment Allocation:** Interest-first allocation. Overpayments above principal + interest are stored in `overpaid_excess`. Full payoff automatically updates loan status to `PAID` and sets `paid_off_date`.
- **Vitest Test Suite (`src/lib/interest/engine.test.ts`):** 24 unit tests covering zero-interest loans, small (₹100) / large (₹1M) loans, single-day duration, calendar period walk, compound interest math, overpayment, payoff, and sequential payment ledgers.

### UI / Responsive Design & Navigation
- **App Layout:** Responsive desktop sidebar and mobile bottom navigation in `AppShell`.
- **Formatting:** Indian Rupee (`₹`) money formatting (`en-IN`), date formatting, and status badges (`PENDING`, `COUNTERED`, `ACCEPTED`, `ACTIVE`, `OVERDUE`, `PARTIALLY_PAID`, `PAID`).
- **Pages Implemented & Verified:**
  - `/` Landing Page
  - `/auth/login` Google Login
  - `/complete-profile` Setup Username & Full Name
  - `/dashboard` Financial summary aggregates (Owed / Owing, Overdue, Due Soon, Open requests)
  - `/requests` Incoming & Sent request lists with tab navigation
  - `/requests/[id]` Request detail & negotiation timeline
  - `/loans/[id]` Loan detail, payment history, & live payment preview/record form
  - `/lent` List of active & paid off loans where user is lender
  - `/borrowed` List of active & paid off loans where user is borrower
  - `/notifications` Notification feed & mark-as-read actions
  - `/profile` Profile overview & sign out
  - `/profile/settings` Change username, update full name/phone, and privacy controls

---

## 4. Consolidated Database Setup Script
A single consolidated SQL setup script has been generated at:
`supabase/combined_setup.sql`

It contains all extensions, enums, table definitions (`profiles`, `privacy_settings`, `loan_requests`, `loan_offers`, `loans`, `payments`, `notifications`), triggers (`handle_new_user`, `handle_active_offer_insert`), RLS policies, grants, and RPCs.

---

## 5. Verification Results
- **TypeScript:** `npx tsc --noEmit` ➔ **0 errors**
- **ESLint:** `npm run lint` ➔ **0 errors**
- **Vitest:** `npm test` ➔ **24 / 24 tests passing**
- **Next.js Production Build:** `npm run build` ➔ **17 / 17 routes compiled cleanly**

---

## 6. Next Steps for Next Agent
1. **Ensure Database Tables Exist:** If PostgREST returns `PGRST205` / `Could not find table in schema cache`, run `supabase/combined_setup.sql` in the Supabase Dashboard SQL Editor (`xlpezxdbdjuzfqyiuxgh.supabase.co`).
2. **Local Server:** Start local dev server with `npm run dev` (`http://localhost:3000`).

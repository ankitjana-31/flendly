# FLENDLY — Comprehensive Project Context & Architecture

> **Brand**: FLENDLY  
> **Version**: 2.4  
> **Repository**: [github.com/ankitjana-31/flendly](https://github.com/ankitjana-31/flendly.git)  
> **Tech Stack**: Next.js 15+ (App Router, Turbopack), React 19, TypeScript, Supabase (Auth, Postgres, RPCs), Tailwind CSS v4, Framer Motion, Lucide React, next-themes  

---

## 1. Executive Summary & Vision

**FLENDLY** is a peer-to-peer debt and loan tracking platform designed to eliminate the awkwardness of informal personal lending between friends, roommates, and colleagues.

### Core Problems Solved:
1. **The 'WhatsApp Mess'**: Forgotten loans, lost receipts, awkward reminder texts, and emotional friction.
2. **Asymmetric Records**: One party thinks ₹1,500 was lent; the other remembers ₹1,000.
3. **Private Offline Tracking**: Many small debts (chai, cabs, groceries) don't need a mutual contract — they just need a quick, private personal ledger that never notifies anyone.

---

## 2. Design System: Stitch Neo-Brutalist Retro OS

The application is themed around a retro operating system aesthetic inspired by Stitch UI prototypes:

* **Hard Shadows**: shadow-[3px_3px_0_0_#000], shadow-[5px_5px_0_0_#000], shadow-[6px_6px_0_0_#000]
* **Borders**: Bold borders order-[2px], order-[2.5px], order-[3px] border-black dark:border-white
* **Color Palette**:
  * **Accent Yellow**: #FFE600 (Call to Actions, Active selections, Warning pills)
  * **Brand Blue**: #2563EB (Primary headers, Navigation highlights, Info pills)
  * **Signal Rose/Pink**: #F43F5E (Debts, Payables, Overdue alerts, Close buttons)
  * **Cyber Teal**: #2DD4BF (Receivables, Lending stats, Success indicators)
  * **Emerald Green**: #10B981 (Settled status, Audit highlights)
  * **Light Canvas**: #FAF8F5 / #FDFBF7 / #F5F2EB (Warm retro paper tone)
  * **Dark Canvas**: #0F1117 / #161821 / #1E212D (Deep retro terminal tone)
* **Typography**:
  * Monospace: ont-mono (JetBrains Mono) for tabular values, status badges, titles, and system indicators.
  * Heading: ont-heading (Syne / Plus Jakarta Sans) for strong headlines.
  * Body: ont-sans (Inter / Plus Jakarta Sans) for descriptions and text flow.
* **Interactive Retro Windows (RetroWindow)**:
  * Titlebar with color accents, interactive minimize (_), maximize (□), and close (✕) buttons.
  * Responsive subtitle and status badges.
  * Tactile button micro-interactions (hover:-translate-y-0.5, ctive:translate-y-0.5 active:shadow-none).
* **Luminous Cursor Halo (CursorGlow)**:
  * Spring-animated trailing glow that dynamically renders in both light and dark themes.

---

## 3. Project Architecture & Directory Map

`
monly/
├── src/
│   ├── app/
│   │   ├── (app)/                       # Authenticated workspace layout with AppShell
│   │   │   ├── dashboard/page.tsx       # Command center, financial stats, personal tracker
│   │   │   ├── lent/page.tsx            # Active & settled receivables
│   │   │   ├── borrowed/page.tsx        # Active & cleared payables
│   │   │   ├── requests/
│   │   │   │   ├── page.tsx             # Incoming / outgoing loan proposals
│   │   │   │   ├── new/page.tsx         # Create proposal form
│   │   │   │   └── [id]/page.tsx        # Negotiation & counter-offer thread
│   │   │   ├── self-track/page.tsx      # Standalone private offline ledger
│   │   │   ├── notifications/page.tsx   # Realtime activity alerts
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx             # Public identity & stats
│   │   │   │   └── settings/page.tsx    # Appearance, handle, privacy config
│   │   │   └── layout.tsx               # AppShell wrapper
│   │   ├── auth/
│   │   │   ├── callback/route.ts        # Supabase OAuth token exchange
│   │   │   └── login/page.tsx           # Google Sign-in screen
│   │   ├── learn-more/page.tsx          # Educational feature walkthrough & story
│   │   ├── complete-profile/page.tsx    # Onboarding username assignment
│   │   ├── layout.tsx                   # Global layout (ThemeProvider, Fonts)
│   │   ├── page.tsx                     # Landing page with interactive preview & audit
│   │   └── globals.css                  # Tailwind v4 theme variables & scanlines
│   ├── components/
│   │   ├── ui/                          # Button, RetroWindow, ThemeToggle, CursorGlow, StatusBadge
│   │   ├── layout/                      # AppShell (Sidebar, Mobile Header & Bottom Nav)
│   │   ├── landing/                     # LandingHero, LandingAuditSection, LandingPreviewSection
│   │   ├── learn-more/                  # LearnMoreHero, LoanAnatomySection, SelfTrackShowcase, FinalCTAFooter
│   │   ├── dashboard/                   # DashboardContent (Financial stats, personal tracker widget)
│   │   ├── self-track/                  # SelfTrackForm, SelfTrackList
│   │   ├── loans/                       # LoanListCard, LoanDetailContent, RepaymentForm
│   │   ├── negotiation/                 # RequestActions, OfferTermsFields, UsernameAutocomplete
│   │   └── users/                       # ProfileDetailsForm, PrivacySettingsForm, ThemeSettingsForm
│   └── lib/
│       ├── auth/                        # actions.ts, queries.ts (Session, profiles, user lookups)
│       ├── supabase/                    # client.ts, server.ts, middleware.ts
│       ├── self-track/                  # actions.ts, queries.ts (Offline private ledger CRUD)
│       ├── loans/                       # queries.ts, actions.ts (Loan contracts & ledgers)
│       ├── requests/                    # actions.ts, queries.ts (Proposals & counter-offers)
│       ├── notifications/               # queries.ts, actions.ts (Alert feeds)
│       └── format.ts                    # Currency (INR ₹), dates, interest calculators
├── supabase/
│   └── migrations/                      # Postgres schema, RLS policies, RPC stored procedures
├── CONTEXT.md                           # This architecture and overview guide
└── MEM.md                               # Recent changelog and development memory
`

---

## 4. Key Functional Workflows

### 4.1. Dual-Sided Mutual Loans
1. User A initiates a loan proposal (/requests/new) specifying amount, due date, and optional simple/compound interest.
2. User B receives an instant notification with counter-offer capability (adjust amount, change date, propose alternative interest).
3. Upon dual confirmation, the proposal crystallizes into an immutable loan record (/loans/[id]).
4. Either party records repayments; the counterparty confirms receipt.
5. Once fully paid, the loan automatically moves to Settled status.

### 4.2. Self Track (Private Offline Ledger)
* 100% private to the user's account.
* Does not send invites or notifications to counterparties.
* Supports partial repayments, context notes (e.g. 'Dinner split', 'Chai advance'), and one-click quick settlements.
* Surfaces dynamic summaries on both the dashboard and dedicated /self-track page.

### 4.3. Dynamic Theme System
* Built on 
ext-themes with defaultTheme=system and enableSystem={true}.
* Default background is white/cream #FAF8F5 in light mode unless device/user prefers dark mode.
* Instant toggle available in landing navbar, login screen, sidebar, and settings.

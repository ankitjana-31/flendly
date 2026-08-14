# MONLY — COMPLETE UI/UX DESIGN & SYSTEM SPECIFICATION
**Version:** 1.0 (Production-Ready Design Handoff)  
**Author:** Manus AI  
**Single Source of Truth:** `MONLY_MASTER_SPEC_FOR_MANUS.md`  

---

## 1. Product Design Philosophy & Visual Identity

Monly is conceived as a modern, friendly, peer-to-peer lending and debt-tracking application designed specifically for trust-based financial arrangements between people who already know each other (friends, family, colleagues). Unlike corporate banking admin panels, Stripe/Revolut fintech clones, or sterile Tailwind templates, Monly prioritizes emotional comfort, relational warmth, and uncompromising clarity.

The visual identity is built on the premise that lending money among peers should not feel intimidating or transactional in a cold way. It balances the high-trust requirements of financial accounting with the approachable aesthetics of modern consumer software.

### Core Design Pillars
1. **Relational Warmth over Corporate Coldness:** Utilizing soft surfaces, warm neutral backdrops, and approachable typography to reduce the social friction often associated with debt.
2. **Uncompromising Financial Rigor:** Ensuring that numbers (principals, interest rates, outstanding balances, payment splits) are presented with absolute typographic clarity and impeccable hierarchical contrast.
3. **Transparent Negotiation:** Framing debt discussions as collaborative timelines rather than rigid bureaucratic forms.
4. **Defensive Simplicity:** Hiding complexity (such as compound interest calculations or amortization schedules) behind intuitive progressive disclosure while keeping raw auditable truth one tap away.

---

## 2. Information Architecture & Navigation

The information architecture is strictly aligned with the backend schema and RLS boundaries established in the master technical specification.

### 2.1 Complete Navigation Structure
* **Global Header / Sidebar:**
  * **Logo & Brand Mark:** Monly wordmark with a subtle pulsing live sync indicator.
  * **Main Links:** Dashboard, Lent, Borrowed, Requests, Notifications.
  * **User Footer / Profile Pill:** Avatar, display name, handle (`@username`), dropdown linking to Profile, Privacy Settings, Theme Switcher, and Sign Out.
* **Mobile Bottom Navigation Bar:**
  * Fixed bar on mobile viewports containing primary tabs: Dashboard, Lent, Borrowed, Requests, Profile. Notifications are accessible via a top-bar bell icon with an unread badge.

### 2.2 Complete Page List & Routing
| Route Path | Page Title | Access & Purpose |
| :--- | :--- | :--- |
| `/` | Landing / Redirect | Public marketing/login landing; redirects to `/dashboard` if authenticated. |
| `/auth/login` | Login | Google OAuth sign-in gateway. |
| `/auth/callback` | Auth Callback | Server-side code exchange and session establishment. |
| `/complete-profile` | Choose Username | First-time mandatory username selection before entering the app. |
| `/dashboard` | Dashboard | Overview of total lent/borrowed, active loans, upcoming deadlines, recent activity. |
| `/lent` | Lent to Others | First-class list of money owed to the user, categorized by status (Active, Overdue, Paid). |
| `/borrowed` | Borrowed from Others | First-class list of money the user owes, categorized by status. |
| `/requests` | Requests | Tabbed list of Incoming and Outgoing loan requests. |
| `/requests/[id]` | Request Detail & Negotiation | Detailed view of a request, full negotiation timeline, counter-offer form, accept/decline actions. |
| `/loans/[id]` | Loan Detail | Authoritative loan ledger showing principal, accrued interest, payment history breakdown, and payment trigger. |
| `/profile` | Profile | Read-only summary of user identity and public presence. |
| `/profile/settings` | Profile & Privacy Settings | Username editing (once-limit enforced) and granular privacy visibility controls. |
| `/notifications` | Notifications | In-app event log with deep links to requests and loans. |

---

## 3. Comprehensive User Flows

### 3.1 Onboarding & Username Selection Flow
1. User arrives at `/auth/login` and clicks **"Continue with Google"**.
2. Authenticates via Google OAuth popup/redirect.
3. Supabase Auth establishes session; redirect hits `/auth/callback` → route handler checks `username_changed_count` and placeholder pattern (`user_xxxxxx`).
4. If first time, user is routed to `/complete-profile`.
5. User enters desired username (e.g., `ankit`); real-time debounced check queries `profiles` for availability.
6. User clicks **"Start Using Monly"** → Server action calls `update_username` RPC → user is redirected to `/dashboard`.

### 3.2 Request & Negotiation Flow
1. User A initiates a loan request to User B (`/requests/new` or quick action from dashboard), specifying direction (`lend` or `borrow`), amount, interest terms, deadline, and optional note.
2. Request is created in `loan_requests` with status `PENDING`, and initial offer is created in `loan_offers` with status `ACTIVE`.
3. User B receives an in-app notification and sees the incoming request under **Requests → Incoming**.
4. User B clicks the request to view `/requests/[id]`. They can choose to:
   * **Accept:** Triggers atomic `accept_offer` RPC, moving request to `ACCEPTED`, creating a row in `loans`, and notifying User A.
   * **Decline:** Moves request to `DECLINED`.
   * **Counter-offer:** Opens counter-offer form where User B modifies amount, interest, or deadline. Submitting inserts a new `loan_offers` row, marks the prior offer as `SUPERSEDED`, and transitions request status to `COUNTERED`.
5. Negotiation continues back and forth; every historical offer remains visible in the immutable negotiation timeline.

### 3.3 Payment & Repayment Flow
1. Borrower navigates to `/loans/[id]` for an active loan.
2. Views current authoritative outstanding balance, principal, and accrued interest computed by the server ledger.
3. Clicks **"Record Payment"**, enters payment amount and date.
4. Client-side preview (powered by TypeScript interest engine twin) displays estimated interest vs. principal split.
5. User confirms payment → Server action calls `record_payment` RPC.
6. PL/pgSQL function locks loan row, walks payment ledger chronologically, computes authoritative interest component and principal component, inserts payment row, and if outstanding reaches zero, updates loan status to `PAID`.
7. UI updates instantly with success state and revalidated authoritative ledger data.

---

## 4. Screen-by-Screen UI Layout Specifications

### 4.1 Dashboard (`/dashboard`)
* **Header Section:** Greeting ("Good morning, Rajarshi"), quick action buttons (**+ New Request**, **+ Record Payment**).
* **Summary Cards (Grid of 2 on mobile, 4 on desktop):**
  1. *Total Lent:* Prominent monetary figure (e.g., ₹45,000.00), green accent indicator, subtitle showing active loan count.
  2. *Total Borrowed:* Monetary figure (e.g., ₹12,000.00), muted neutral/warning accent, active borrow count.
  3. *Net Balance:* Net financial position (`Lent - Borrowed`) with clear positive/negative coloring.
  4. *Pending Actions:* Badge showing open incoming requests requiring attention.
* **Urgent / Upcoming Section:** Cards highlighting loans with deadlines within 3 days or overdue loans (highlighted with subtle danger border).
* **Recent Activity Feed:** Chronological list of recent events (payments recorded, offers accepted, new requests) with rich icons and timestamps.

### 4.2 Lent (`/lent`) & Borrowed (`/borrowed`) Pages
* **Page Header:** Page title, search bar (filtering by participant name/username), and status filter tabs (`All`, `Active`, `Partially Paid`, `Overdue`, `Paid`).
* **Loan Card Grid / List:** Each card displays:
  * Participant Avatar and Full Name with `@username` subtitle.
  * Status Badge (Active, Overdue, etc.).
  * Original Principal vs. Current Outstanding (clear visual distinction: principal in muted text, outstanding in bold primary text).
  * Interest Terms pill (e.g., "5% monthly simple").
  * Due Date with countdown or overdue indicator.
  * Quick action footer (e.g., "View Ledger", "Record Payment").
* **Empty State:** Illustrated empty state with contextual copy (e.g., *"You haven't lent anyone money yet. When you lend, your active agreements and repayment tracking will appear here."*).

### 4.3 Requests (`/requests`)
* **Segmented Tabs:** **Incoming** (Requests sent to you) vs. **Outgoing** (Requests you initiated).
* **Request Cards:** Displaying sender/recipient, requested amount, interest summary, deadline, and current status. Incoming requests feature direct action buttons (**Accept**, **Decline**, **Counter**).

### 4.4 Negotiation / Counter-Offer Interface (`/requests/[id]`)
* **Participants Header:** Visual card showing User A and User B connected by a directional lending arrow.
* **Negotiation Timeline (`<NegotiationTimeline>`):** A vertical chat-like timeline showing the history of proposals. Each proposal block is styled as an immutable message card:
  * *Sender header:* Avatar, timestamp, and label ("Rajarshi proposed").
  * *Terms grid:* Amount, interest type & rate, deadline, and personal note.
  * *Status pill:* `Active`, `Superceded`, `Accepted`, or `Declined`.
* **Action Footer:** If the user is the recipient of the active offer, fixed bottom action bar with **Accept**, **Decline**, and **Counter** triggers. Clicking **Counter** expands an inline form with pre-filled values from the active offer, allowing modifications before submission.

### 4.5 Loan Detail (`/loans/[id]`)
* **Loan Overview Banner:** Large outstanding balance display, progress bar showing percentage of principal repaid, status badge, and key dates (Start Date, Due Date).
* **Contractual Terms Panel:** Static, immutable summary of agreed principal, interest type, rate, frequency, and compounding frequency.
* **Payment History & Ledger Table (`<LoanLedgerTable>`):**
  * Table columns: `Date`, `Payer`, `Total Paid`, `Interest Allocation`, `Principal Allocation`, `Remaining Outstanding`, `Note`.
  * Every row accurately reflects the frozen `interest_component` and `principal_component` stored immutably in the database.
* **Payment Trigger:** Prominent **"Record Payment"** button opening the payment modal/sheet.

### 4.6 Payment Flow Modal (`PaymentForm` & `PaymentPreview`)
* **Modal / Drawer Dialog:** Clean overlay with clear title ("Record Payment for @ankit").
* **Inputs:** Amount (`₹`), Payment Date (default today, max today), Optional Note.
* **Live Advisory Preview Box:**
  * Current Outstanding: ₹10,000.00
  * Estimated Interest Coverage: ₹500.00
  * Estimated Principal Reduction: ₹4,500.00
  * Projected New Outstanding: ₹5,000.00
  * *Disclaimer text:* *"Final allocation is computed authoritatively by the server upon submission."*
* **Primary Action:** **"Confirm Payment"** (loading state during Server Action execution).

### 4.7 Profile (`/profile`) & Privacy Settings (`/profile/settings`)
* **Profile Summary:** Avatar upload preview, Full Name, Email (non-editable), Phone, and public `@username`.
* **Username Management:** Input field for username with availability checker. Displays remaining changes (1 allowed after initial setup).
* **Privacy Controls Section:** Granular toggles and dropdowns for:
  * Avatar Visibility (`Everyone` | `Participants` | `Nobody`)
  * Email Visibility (`Only Me` | `Participants`)
  * Phone Visibility (`Only Me` | `Participants`)
* *Informational tooltip:* Explaining that "Participants" refers to users with whom you have active or past loan requests/agreements.

### 4.8 Notifications (`/notifications`)
* **List View:** Chronological stream of notifications with unread highlight state.
* **Notification Types & Icons:** New request, counter-offer, offer accepted, payment recorded, deadline reminder, overdue notice, fully paid.
* **Action:** Clicking any notification instantly marks it as read and navigates directly to the referenced request or loan detail page.

---

## 5. Visual Design System & Design Tokens

### 5.1 Color Palette Options Explored
* **Option A: Corporate FinTech Blue** (Standard navy/blue palette — rejected as it feels like a generic bank).
* **Option B: Neo-Neon Cyber Dark** (High-contrast dark mode with neon accents — rejected due to excessive visual fatigue for personal debt tracking).
* **Option C: Warm Organic Trust (Recommended)** — A refined, human-centric palette featuring deep slate charcoal text, warm stone/sand backgrounds, rich emerald success tones, and restrained amber/coral alerts.

### 5.2 Recommended Final Color Palette (Light & Dark Modes)

| Token Role | Light Theme (`light`) | Dark Theme (`dark`) |
| :--- | :--- | :--- |
| **Background (`bg-background`)** | `#FBFBFA` (Warm Off-White / Alabaster) | `#121316` (Deep Obsidian Charcoal) |
| **Surface (`bg-card`)** | `#FFFFFF` (Pure White) | `#1A1C23` (Elevated Slate Surface) |
| **Surface Muted (`bg-muted`)** | `#F4F4F2` (Soft Stone) | `#232630` (Muted Border Surface) |
| **Primary Text (`text-foreground`)** | `#111318` (Near Black Charcoal) | `#F3F4F6` (Bright Off-White) |
| **Muted Text (`text-muted-foreground`)** | `#6B7280` (Balanced Cool Gray) | `#9CA3AF` (Light Gray Muted) |
| **Primary Brand (`primary`)** | `#0F172A` (Rich Slate / Midnight) | `#F8FAFC` (Inverted Slate) |
| **Accent / Action (`accent`)** | `#2563EB` (Trust Blue) | `#3B82F6` (Bright Blue) |
| **Success (`success`)** | `#059669` (Deep Emerald Green) | `#10B981` (Vibrant Emerald) |
| **Warning (`warning`)** | `#D97706` (Warm Amber) | `#F59E0B` (Amber Gold) |
| **Danger (`danger`)** | `#DC2626` (Red) | `#EF4444` (Bright Red) |
| **Border (`border`)** | `#E5E7EB` (Subtle Light Gray) | `#2D323F` (Subtle Dark Border) |

### 5.3 Typography System
* **Primary Body & UI Font:** `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
* **Heading Font:** `Plus Jakarta Sans` or `Inter` with semibold/bold weights (-0.02em letter spacing for refined titles).
* **Financial & Numeric Treatment:** `JetBrains Mono` or tabular figures (`font-mono`) for all monetary values (`₹12,450.00`) to guarantee perfect vertical alignment in tables and financial summaries.

---

## 6. Component Library & Variants

* **Button:** Variants (`primary`, `secondary`, `outline`, `ghost`, `danger`), Sizes (`sm`, `md`, `lg`), states (`default`, `hover`, `active`, `disabled`, `loading` with spinner).
* **Input / AmountInput:** Text fields with built-in prefix support (`₹`), error states, helper text, and clear focus rings.
* **InterestSelector:** Segmented control for `No Interest`, `Simple Interest`, `Compound Interest`, paired with conditional sub-inputs for rate, frequency, and compounding.
* **StatusBadge:** Pill component supporting variants (`active`, `partially-paid`, `overdue`, `paid`, `pending`, `countered`, `declined`), with accessible color and icon indicators.
* **UserAvatar / UserCard:** Avatar component with fallback initials and visibility-aware border indicators.
* **LoanCard:** Standardized card container with hover elevation, status badge, participant info, financial breakdown, and action triggers.
* **Modal / Drawer:** Accessible overlay container with backdrop blur, keyboard trap (ESC to close), and smooth enter/exit animations.

---

## 7. Responsive Behavior & Accessibility

### 7.1 Responsive Breakpoints
* **Mobile (`< 648px`):** Single-column layouts, sticky bottom navigation bar, collapsed tables transforming into card lists, full-screen modals/drawers.
* **Tablet (`648px – 1024px`):** Two-column dashboard grids, collapsible sidebar or top navigation, optimized negotiation timeline.
* **Desktop (`> 1024px`):** Permanent desktop sidebar navigation, multi-column dashboard, spacious data tables, side-by-side negotiation views.

### 7.2 Accessibility (A11y) Standards
* **Contrast:** All text meets WCAG AA standards against background surfaces in both light and dark modes.
* **Keyboard Navigation:** Full tab-index support across all interactive elements, forms, and dialogs with visible `focus-visible` outlines.
* **ARIA Attributes:** Proper labelling on icon-only buttons, live regions for real-time notification badge updates, and semantic heading hierarchy (`h1` through `h4`).
* **Non-Color Indicators:** Statuses are communicated using text labels and icons alongside color, ensuring universal comprehension.

---

## 8. Exact UI Implementation Guidance for Codex

When Codex proceeds to implement this design specification in Next.js 14+ App Router, the following architectural rules must be strictly adhered to:
1. **Zero Backend Alteration:** Do not modify the Supabase schema, RLS policies, or SQL RPC functions specified in `MONLY_MASTER_SPEC_FOR_MANUS.md`.
2. **Server-First Data Fetching:** Use Server Components for all initial page data loads, passing typed props down to Client Components only where interactivity is required.
3. **Strict Form Validation:** Use Zod schemas matching database CHECK constraints for all client form validations before submitting to Server Actions.
4. **Client Preview Limitation:** Client-side interest calculations (in `PaymentForm` or loan calculators) must be explicitly badged as "Estimates" and must never bypass or impersonate the authoritative server-side PostgreSQL ledger.
5. **Theme Support:** Leverage `next-themes` with CSS variables mapped to the light/dark color palette tokens defined in Section 5.2.

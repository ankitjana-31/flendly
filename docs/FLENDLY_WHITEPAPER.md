# Flendly: From Tracking Money Between Friends to a More Transparent Social Lending Experience

*Author: Ankit Jana & The Flendly Project*  
*Date: October 2026*  
*Website: [flendly.vercel.app](https://flendly.vercel.app) | Repository: [github.com/ankitjana-31/flendly](https://github.com/ankitjana-31/flendly)*

---

## 1. Introduction & The Problem We Set Out to Solve

Almost everyone has lent money to a friend, roommate, or colleague. In most cases, the agreement starts casually: a quick text on WhatsApp, a verbal promise over coffee, or an informal transfer to cover a deposit or a medical bill. 

Informal lending between friends is fast and built on goodwill, but it carries a well-known set of problems:
- **Asymmetric memory**: People genuinely remember numbers differently. One person remembers lending ₹5,000; the other remembers ₹4,000 because they mentally subtracted an earlier dinner split.
- **Lost context**: Loan details get buried under hundreds of unrelated chat messages, receipts, and photos.
- **The reminder friction**: Asking a friend for your own money back feels awkward and confrontational. Many people delay asking until frustration builds up, damaging the friendship.
- **Tool mismatch**: Existing tools fall into two extremes. Expense splitters like Splitwise are built for shared apartment bills and group dinners, not discrete loans with fixed repayment deadlines or interest. On the other end, banks and micro-lending apps require credit checks, invasive underwriting, and heavy bureaucratic paperwork for what should be a simple arrangement between two people who trust each other.

We built **Flendly** to fill this gap: a mutual debt and loan tracker that acts as a neutral, agreed-upon record for personal finance.

---

## 2. What Flendly Is Today

Flendly is an active web application. It does not move money directly or touch bank accounts. Instead, it serves as the **authoritative system of record** for informal loans. 

When you use Flendly with someone, both of you see the exact same numbers, dates, and repayment history. Neither party can unilaterally change terms after an agreement is made.

### Core Features in the Current Application

#### 1. Dual-Sided Proposals & Negotiation
Lending is a two-way agreement. In Flendly, an agreement cannot exist without mutual consent:
- A user creates a proposal to **Lend** or **Borrow** money, specifying the counterparty's username, principal amount (capped at ₹1,00,000 for safety), interest terms, and target repayment date.
- The recipient receives a notification and reviews the proposal. They can accept it, decline it, or submit a counter-offer with adjusted terms (e.g., asking for an extra month or proposing a different amount).
- To prevent proposals from sitting in limbo indefinitely, proposals have a built-in approval window: **12 hours** for short-term loans (repayment within 2 days) and **24 hours** for longer durations. If unaccepted within that window, the proposal automatically expires and cancels.

#### 2. The Official Loan Record
Once both parties agree, the proposal becomes an active, immutable loan record:
- Both lender and borrower see the exact same view: principal, current balance, interest accrued to date, and days remaining until the deadline.
- When money is repaid offline (via cash, UPI, or bank transfer), the borrower logs the payment with a date and optional note.
- To prevent disputes over whether money was actually received, payments enter a `PENDING` state. The lender must review and explicitly confirm receipt before the balance updates on the official ledger.

#### 3. Calendar-Accurate Interest Calculations
While many friend loans are interest-free, some arrangements (such as lending substantial sums over multiple months or years) involve agreed-upon interest. 

Flendly includes an interest calculation engine that supports **Simple** and **Compound** interest across daily, monthly, and yearly intervals. Rather than relying on approximate 30-day months, the engine tracks exact calendar periods. Every payment clears accrued interest first before paying down principal, matching standard financial amortization rules while keeping the math completely transparent to both users.

#### 4. Self Track: The Private Offline Ledger
Not every debt needs a formal agreement with another person. If you split a cab, bought lunch for a colleague, or lent cash to someone who isn't on Flendly, you just want a personal notepad that tracks what you are owed.

Flendly includes **Self Track**, an isolated personal ledger:
- 100% private: It never sends invites, emails, or notifications to anyone.
- Tracks both "Money I Lent" and "Money I Borrowed".
- Supports partial repayments and notes.
- Summarized on a dedicated dashboard with net standing metrics ("You are owed more" / "You owe more").

#### 5. User Interface & Design Philosophy
Flendly uses a **Neo-Brutalist Retro OS** design language. Rather than looking like a sterile corporate fintech app, it uses high-contrast borders, tactile drop shadows, and distinct window panels inspired by classic desktop operating systems. 

The application includes five carefully balanced color themes:
- **Light Mode**: Warm cream paper aesthetic (`#FAF8F5`).
- **Dark Mode**: High-contrast terminal aesthetic (`#0F1117`).
- **Ocean**: Deep navy blue palette (`#071827`).
- **Sunset**: Warm maroon and cream workspace (`#24121D`).
- **Tropical**: Mint and teal forest theme (`#062522`).

Every theme maintains high contrast across all form inputs, labels, and status badges.

---

## 3. High-Level Technical Architecture

Flendly is built with modern, battle-tested open-source web technologies:

- **Frontend**: Next.js 16 (React 19) utilizing the App Router, React Server Components (RSC), and Server Actions for data mutations.
- **Styling**: Tailwind CSS v4 with custom dark mode variant selectors and CSS custom properties for instant theme switching.
- **Database & Security**: PostgreSQL hosted on Supabase. Security is enforced at the database layer through **Row Level Security (RLS)** policies. Even if a client bypasses the application code, the database refuses to read or write rows that do not belong to the authenticated user.
- **Real-Time Synchronization**: Supabase Realtime (WebSockets) maintains an active channel for each logged-in user. When a loan status changes, a counter-offer is received, or a payment is recorded, the database publishes the event and updates the user's interface within 300 milliseconds without requiring a full manual browser refresh.
- **Integrity & Tests**: 30 automated unit tests (Vitest) verify interest formulas, calendar leap-year edge cases, approval countdowns, and safety constraints on every build.

---

## 4. The Long-Term Vision: A Social Lending Discovery Marketplace

Today, Flendly solves debt tracking between people who already know each other. But the underlying mechanics—negotiation, agreement crystallization, immutable ledgers, and verified repayment tracking—can naturally evolve into something larger: **a transparent social lending discovery marketplace**.

```
                           THE EVOLUTION OF FLENDLY
                           
  +--------------------------------+       +------------------------------------+
  |             TODAY              |       |             THE FUTURE             |
  |                                |       |                                    |
  |  * Closed 1-on-1 network       |  -->  |  * Open Discover marketplace       |
  |  * Offline payment tracking    |       |  * Integrated escrow disbursements |
  |  * Manual payment confirmation |       |  * Automated recurring collections |
  |  * Trust based on friendship   |       |  * Verifiable social credit score  |
  +--------------------------------+       +------------------------------------+
```

### The Concept

Traditional personal credit is broken. Banks rely on rigid, opaque credit scores that often penalize young people, freelancers, and small creators who lack traditional payslips but have reliable income and strong social credibility. Meanwhile, predatory payday loan apps charge exorbitant hidden interest rates and engage in aggressive collection tactics.

We envision Flendly evolving into an open, community-driven alternative where credit is transparent, consensual, and human-scaled:

1. **The Discover Feed**: Borrowers who need funding for personal projects, equipment purchases, or short-term emergencies can post an open funding request to a community feed.
2. **Competitive Lender Proposals**: Lenders on the platform can review open requests and offer terms: how much they are willing to lend, their proposed interest rate, and the repayment schedule. Borrowers can compare multiple offers side-by-side and choose the one that fits best.
3. **Pseudonymous Privacy with Verified Trust**: Users interact publicly using handles or aliases to protect their personal privacy. Identity verification (KYC) is completed privately on the platform and only referenced if a formal dispute arises.
4. **Repayment Reputation (Social Credit)**: Every loan successfully negotiated and settled on Flendly contributes to a public, verifiable repayment score. Reliable borrowers build visible credibility that helps them access better terms over time without needing a legacy bank score.
5. **Integrated Payment & Disbursement Infrastructure**: Eventually, Flendly could integrate authorized payment processing partners to disburse loan funds directly into borrower accounts upon mutual contract acceptance, and automate scheduled repayments through recurring banking mandates (such as e-NACH or UPI AutoPay).
6. **Regulatory Compliance & Safety First**: Transitioning from a tracking tool to a real-money lending marketplace requires thoughtful adherence to financial regulations, non-banking financial company (NBFC) partnerships or licensing, anti-money laundering (AML) controls, and transparent legal risk disclosures for lenders.

---

## 5. Summary

Flendly began with a simple, personal premise: money borrowed between friends should never cost you the friendship. 

By taking informal debts out of messy chat histories and putting them into clear, mutual contracts, Flendly provides clarity, removes the awkwardness of asking for repayment, and ensures everyone stays on the same page. 

As we look to the future, the same principles of transparency, mutual consent, and structured ledgers will guide Flendly's growth into a fairer, more open social lending platform.

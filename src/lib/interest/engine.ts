/**
 * Advisory-only interest engine.
 *
 * This is a UX preview for the payment form ("if you pay ₹X today, ~₹Y goes
 * to interest, ~₹Z to principal") and is structurally identical to the
 * authoritative PL/pgSQL twin in supabase/migrations/0015_fn_loan_ledger.sql
 * (calendar_periods_elapsed / accrue_simple_interest / accrue_compound_interest
 * / compute_loan_ledger).
 *
 * IMPORTANT: nothing computed here is ever sent to record_payment() as a
 * value to be trusted. The server always recomputes the authoritative
 * allocation itself from `compute_loan_ledger`. This module exists purely
 * so the UI can show a live estimate before submit.
 *
 * Pure functions only: no I/O, no implicit `Date.now()` — `asOf` is always
 * an explicit parameter.
 */

import Decimal from "decimal.js";

export type InterestType = "none" | "simple" | "compound";
export type InterestFrequency = "daily" | "monthly" | "yearly";

export type LoanTerms = {
  principalAmount: string | number;
  interestType: InterestType;
  interestRate: string | number | null;
  interestFrequency: InterestFrequency | null;
  compounding: InterestFrequency | null;
  startDate: string; // ISO date (yyyy-MM-dd)
  dueDate: string;
  paidOffDate: string | null;
};

export type PaymentRecord = {
  amount: string | number;
  paymentDate: string; // ISO date
};

type PeriodsElapsed = {
  fullPeriods: number;
  remainderDays: number;
  periodLenDays: number;
};

function toDate(iso: string): Date {
  // Parse as UTC midnight so day-diff math is unaffected by local timezone.
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addPeriod(date: Date, freq: InterestFrequency): Date {
  const d = new Date(date.getTime());
  if (freq === "daily") {
    d.setUTCDate(d.getUTCDate() + 1);
  } else if (freq === "monthly") {
    d.setUTCMonth(d.getUTCMonth() + 1);
  } else {
    d.setUTCFullYear(d.getUTCFullYear() + 1);
  }
  return d;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/**
 * Calendar-accurate period walk. Mirrors calendar_periods_elapsed() in SQL:
 * walks whole periods forward from `anchor`, then measures the leftover
 * days against the length of the next (partial) period.
 */
export function calendarPeriodsElapsed(
  freq: InterestFrequency,
  anchor: string,
  asOf: string,
): PeriodsElapsed {
  const anchorDate = toDate(anchor);
  const asOfDate = toDate(asOf);

  if (asOfDate <= anchorDate) {
    const next = addPeriod(anchorDate, freq);
    return { fullPeriods: 0, remainderDays: 0, periodLenDays: diffDays(anchorDate, next) };
  }

  if (freq === "daily") {
    return { fullPeriods: diffDays(anchorDate, asOfDate), remainderDays: 0, periodLenDays: 1 };
  }

  let cursor = anchorDate;
  let next = addPeriod(cursor, freq);
  let fullPeriods = 0;

  while (next <= asOfDate) {
    cursor = next;
    next = addPeriod(cursor, freq);
    fullPeriods += 1;
  }

  return {
    fullPeriods,
    remainderDays: diffDays(cursor, asOfDate),
    periodLenDays: diffDays(cursor, next),
  };
}

export function accrueSimpleInterest(
  principal: Decimal.Value,
  rate: Decimal.Value | null,
  freq: InterestFrequency | null,
  anchor: string,
  asOf: string,
): Decimal {
  const p = new Decimal(principal);
  if (rate == null || freq == null || asOf <= anchor || p.lte(0)) {
    return new Decimal(0);
  }

  const { fullPeriods, remainderDays, periodLenDays } = calendarPeriodsElapsed(freq, anchor, asOf);
  const periodsElapsed = new Decimal(fullPeriods).plus(
    new Decimal(remainderDays).dividedBy(Math.max(periodLenDays, 1)),
  );

  return p.times(new Decimal(rate).dividedBy(100)).times(periodsElapsed).toDecimalPlaces(2);
}

const NOMINAL_DAYS: Record<InterestFrequency, number> = {
  daily: 1,
  monthly: 365.2425 / 12,
  yearly: 365.2425,
};

export function accrueCompoundInterest(
  principal: Decimal.Value,
  rate: Decimal.Value | null,
  freq: InterestFrequency | null,
  compounding: InterestFrequency | null,
  anchor: string,
  asOf: string,
): Decimal {
  const p = new Decimal(principal);
  if (rate == null || freq == null || compounding == null || asOf <= anchor || p.lte(0)) {
    return new Decimal(0);
  }

  const periodRate = new Decimal(rate)
    .times(NOMINAL_DAYS[compounding] / NOMINAL_DAYS[freq])
    .dividedBy(100);

  const { fullPeriods, remainderDays, periodLenDays } = calendarPeriodsElapsed(
    compounding,
    anchor,
    asOf,
  );

  const compounded = p.times(new Decimal(1).plus(periodRate).pow(fullPeriods));
  const partial = compounded.times(periodRate).times(new Decimal(remainderDays).dividedBy(Math.max(periodLenDays, 1)));

  return compounded.plus(partial).minus(p).toDecimalPlaces(2);
}

export function calculateAccruedInterest(
  terms: Pick<LoanTerms, "interestType" | "interestRate" | "interestFrequency" | "compounding">,
  principal: Decimal.Value,
  anchor: string,
  asOf: string,
): Decimal {
  if (terms.interestType === "none" || asOf <= anchor) return new Decimal(0);
  if (terms.interestType === "simple") {
    return accrueSimpleInterest(principal, terms.interestRate, terms.interestFrequency, anchor, asOf);
  }
  return accrueCompoundInterest(
    principal,
    terms.interestRate,
    terms.interestFrequency,
    terms.compounding,
    anchor,
    asOf,
  );
}

export type LedgerRow = {
  payment: PaymentRecord;
  interestPortion: Decimal;
  principalPortion: Decimal;
  overpaidExcess: Decimal;
  principalAfter: Decimal;
  unpaidInterestAfter: Decimal;
};

export type LedgerResult = {
  outstanding: Decimal;
  principal: Decimal;
  unpaidInterest: Decimal;
  rows: LedgerRow[];
};

/**
 * Advisory event-driven ledger walk — same algorithm as compute_loan_ledger()
 * in SQL. Used only to render a live "what would this payment do" preview;
 * the authoritative figures always come back from the record_payment RPC
 * response.
 */
export function computeLedger(terms: LoanTerms, payments: PaymentRecord[], asOf: string): LedgerResult {
  const effectiveAsOf = terms.paidOffDate && asOf > terms.paidOffDate ? terms.paidOffDate : asOf;

  let principal = new Decimal(terms.principalAmount);
  let unpaidInterest = new Decimal(0);
  let anchor = terms.startDate;
  const rows: LedgerRow[] = [];

  const sorted = [...payments].sort((a, b) => (a.paymentDate < b.paymentDate ? -1 : 1));

  for (const p of sorted) {
    if (p.paymentDate > effectiveAsOf) continue;

    const segmentInterest = calculateAccruedInterest(terms, principal, anchor, p.paymentDate);
    unpaidInterest = unpaidInterest.plus(segmentInterest);

    const amount = new Decimal(p.amount);
    const interestPortion = Decimal.min(amount, unpaidInterest);
    const principalPortion = Decimal.min(amount.minus(interestPortion), principal);
    const overpaidExcess = amount.minus(interestPortion).minus(principalPortion);

    unpaidInterest = unpaidInterest.minus(interestPortion);
    principal = principal.minus(principalPortion);
    anchor = p.paymentDate;

    rows.push({
      payment: p,
      interestPortion,
      principalPortion,
      overpaidExcess,
      principalAfter: principal,
      unpaidInterestAfter: unpaidInterest,
    });
  }

  const tailInterest = calculateAccruedInterest(terms, principal, anchor, effectiveAsOf);
  unpaidInterest = unpaidInterest.plus(tailInterest);

  return {
    outstanding: principal.plus(unpaidInterest),
    principal,
    unpaidInterest,
    rows,
  };
}

/**
 * Preview a single new payment against the current ledger state — this is
 * what PaymentForm calls to show the live "estimated interest / principal
 * split" box. Purely advisory.
 */
export function previewPayment(
  terms: LoanTerms,
  existingPayments: PaymentRecord[],
  amount: Decimal.Value,
  paymentDate: string,
): {
  currentOutstanding: Decimal;
  interestCoverage: Decimal;
  principalReduction: Decimal;
  overpaidExcess: Decimal;
  projectedOutstanding: Decimal;
} {
  const before = computeLedger(terms, existingPayments, paymentDate);
  const after = computeLedger(
    terms,
    [...existingPayments, { amount: new Decimal(amount).toString(), paymentDate }],
    paymentDate,
  );

  const lastRow = after.rows[after.rows.length - 1];

  return {
    currentOutstanding: before.outstanding,
    interestCoverage: lastRow?.interestPortion ?? new Decimal(0),
    principalReduction: lastRow?.principalPortion ?? new Decimal(0),
    overpaidExcess: lastRow?.overpaidExcess ?? new Decimal(0),
    projectedOutstanding: after.outstanding,
  };
}

export function isOverdue(terms: Pick<LoanTerms, "dueDate">, outstanding: Decimal, asOf: string): boolean {
  return asOf > terms.dueDate && outstanding.gt(0);
}

export function isPartiallyPaid(payments: PaymentRecord[], outstanding: Decimal): boolean {
  return payments.length > 0 && outstanding.gt(0);
}

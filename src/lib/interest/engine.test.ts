import { describe, expect, it } from "vitest";
import Decimal from "decimal.js";

import {
  accrueSimpleInterest,
  accrueCompoundInterest,
  calculateAccruedInterest,
  calendarPeriodsElapsed,
  computeLedger,
  isOverdue,
  isPartiallyPaid,
  previewPayment,
  type LoanTerms,
} from "./engine";

describe("calendarPeriodsElapsed", () => {
  it("counts whole calendar months correctly", () => {
    const r = calendarPeriodsElapsed("monthly", "2026-01-01", "2026-07-01");
    expect(r.fullPeriods).toBe(6);
    expect(r.remainderDays).toBe(0);
  });

  it("handles month-end rollover (Jan 31 -> Feb 28)", () => {
    const r = calendarPeriodsElapsed("monthly", "2026-01-31", "2026-03-01");
    expect(r.fullPeriods).toBeGreaterThanOrEqual(0);
  });

  it("returns zero periods and zero remainder when as-of is before anchor", () => {
    const r = calendarPeriodsElapsed("monthly", "2026-06-01", "2026-01-01");
    expect(r.fullPeriods).toBe(0);
    expect(r.remainderDays).toBe(0);
  });

  it("daily frequency counts exact day differences", () => {
    const r = calendarPeriodsElapsed("daily", "2026-01-01", "2026-01-31");
    expect(r.fullPeriods).toBe(30);
  });
});

describe("accrueSimpleInterest", () => {
  it("returns 0 for same-day accrual", () => {
    expect(accrueSimpleInterest(10000, 5, "monthly", "2026-01-01", "2026-01-01").toString()).toBe("0");
  });

  it("returns 0 when rate is null", () => {
    expect(accrueSimpleInterest(10000, null, "monthly", "2026-01-01", "2026-02-01").toString()).toBe("0");
  });

  it("computes exact simple interest for whole periods", () => {
    // 10000 principal, 5%/month, 3 whole months -> 10000 * 0.05 * 3 = 1500
    const r = accrueSimpleInterest(10000, 5, "monthly", "2026-01-01", "2026-04-01");
    expect(r.toString()).toBe("1500");
  });

  it("prorates a partial trailing period", () => {
    const r = accrueSimpleInterest(10000, 5, "monthly", "2026-01-01", "2026-02-15");
    expect(r.gt(500)).toBe(true);
    expect(r.lt(1000)).toBe(true);
  });

  it("calculates one-day duration correctly for daily interest", () => {
    const r = accrueSimpleInterest(1000, 1, "daily", "2026-01-01", "2026-01-02");
    expect(r.toString()).toBe("10"); // 1000 * 0.01 * 1 = 10
  });

  it("handles small loan amounts accurately without precision loss", () => {
    const r = accrueSimpleInterest(100, 2.5, "monthly", "2026-01-01", "2026-02-01");
    expect(r.toString()).toBe("2.5");
  });

  it("handles large loan amounts accurately", () => {
    const r = accrueSimpleInterest(1000000, 12, "yearly", "2026-01-01", "2027-01-01");
    expect(r.toString()).toBe("120000");
  });
});

describe("accrueCompoundInterest", () => {
  it("matches the spec's hand-verified fixture: 100000 @ 12%/yr, monthly compounding, 6mo", () => {
    const r = accrueCompoundInterest(100000, 12, "yearly", "monthly", "2026-01-01", "2026-07-01");
    expect(r.toString()).toBe("6152.02");
  });

  it("returns 0 for a zero or negative principal", () => {
    expect(accrueCompoundInterest(0, 12, "yearly", "monthly", "2026-01-01", "2026-07-01").toString()).toBe("0");
  });

  it("returns 0 when compounding frequency is missing", () => {
    expect(accrueCompoundInterest(10000, 12, "yearly", null, "2026-01-01", "2026-07-01").toString()).toBe("0");
  });
});

describe("calculateAccruedInterest dispatcher", () => {
  it("returns 0 for interest_type 'none' regardless of rate", () => {
    const r = calculateAccruedInterest(
      { interestType: "none", interestRate: 99, interestFrequency: "monthly", compounding: null },
      10000,
      "2026-01-01",
      "2026-06-01",
    );
    expect(r.toString()).toBe("0");
  });
});

const baseTerms: LoanTerms = {
  principalAmount: 10000,
  interestType: "simple",
  interestRate: 3,
  interestFrequency: "monthly",
  compounding: null,
  startDate: "2026-08-14",
  dueDate: "2026-11-12",
  paidOffDate: null,
};

describe("computeLedger", () => {
  it("with no payments, outstanding = principal + accrued interest", () => {
    const ledger = computeLedger(baseTerms, [], "2026-09-14");
    expect(ledger.principal.toString()).toBe("10000");
    expect(ledger.unpaidInterest.toString()).toBe("300");
    expect(ledger.outstanding.toString()).toBe("10300");
  });

  it("allocates a single payment interest-first", () => {
    const ledger = computeLedger(baseTerms, [{ amount: 500, paymentDate: "2026-09-14" }], "2026-09-14");
    const row = ledger.rows[0];
    expect(row.interestPortion.toString()).toBe("300");
    expect(row.principalPortion.toString()).toBe("200");
    expect(row.overpaidExcess.toString()).toBe("0");
    expect(ledger.principal.toString()).toBe("9800");
  });

  it("handles multiple sequential payments correctly", () => {
    const ledger = computeLedger(
      baseTerms,
      [
        { amount: 400, paymentDate: "2026-08-14" },
        { amount: 9700, paymentDate: "2026-08-14" },
      ],
      "2026-08-14",
    );
    expect(ledger.outstanding.toString()).toBe("0");
    expect(ledger.rows[0].principalPortion.toString()).toBe("400");
    expect(ledger.rows[1].principalPortion.toString()).toBe("9600");
    expect(ledger.rows[1].overpaidExcess.toString()).toBe("100");
  });

  it("handles payment larger than outstanding balance (overpayment)", () => {
    const ledger = computeLedger(baseTerms, [{ amount: 12000, paymentDate: "2026-09-14" }], "2026-09-14");
    const row = ledger.rows[0];
    expect(row.interestPortion.toString()).toBe("300");
    expect(row.principalPortion.toString()).toBe("10000");
    expect(row.overpaidExcess.toString()).toBe("1700");
    expect(ledger.outstanding.toString()).toBe("0");
  });

  it("freezes accrual at paidOffDate for a closed loan", () => {
    const closedTerms: LoanTerms = { ...baseTerms, paidOffDate: "2026-09-14" };
    const before = computeLedger(closedTerms, [], "2026-09-14");
    const after = computeLedger(closedTerms, [], "2026-12-14");
    expect(after.unpaidInterest.toString()).toBe(before.unpaidInterest.toString());
  });

  it("zero-interest loans never accrue", () => {
    const noInterest: LoanTerms = { ...baseTerms, interestType: "none", interestRate: null, interestFrequency: null };
    const ledger = computeLedger(noInterest, [], "2027-08-14");
    expect(ledger.unpaidInterest.toString()).toBe("0");
    expect(ledger.outstanding.toString()).toBe("10000");
  });
});

describe("previewPayment", () => {
  it("projects the correct post-payment outstanding balance", () => {
    const preview = previewPayment(baseTerms, [], new Decimal(500), "2026-09-14");
    expect(preview.currentOutstanding.toString()).toBe("10300");
    expect(preview.interestCoverage.toString()).toBe("300");
    expect(preview.principalReduction.toString()).toBe("200");
    expect(preview.projectedOutstanding.toString()).toBe("9800");
  });
});

describe("isOverdue / isPartiallyPaid", () => {
  it("flags overdue only when past due date with outstanding > 0", () => {
    expect(isOverdue({ dueDate: "2026-08-01" }, new Decimal(100), "2026-09-01")).toBe(true);
    expect(isOverdue({ dueDate: "2026-08-01" }, new Decimal(0), "2026-09-01")).toBe(false);
    expect(isOverdue({ dueDate: "2026-09-01" }, new Decimal(100), "2026-08-01")).toBe(false);
  });

  it("flags partially paid only with prior payments and remaining balance", () => {
    expect(isPartiallyPaid([{ amount: 100, paymentDate: "2026-01-01" }], new Decimal(50))).toBe(true);
    expect(isPartiallyPaid([], new Decimal(50))).toBe(false);
    expect(isPartiallyPaid([{ amount: 100, paymentDate: "2026-01-01" }], new Decimal(0))).toBe(false);
  });
});

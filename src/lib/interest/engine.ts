export function getDaysDiff(d1: Date, d2: Date): number {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

export function addInterval(date: Date, interval: "daily" | "monthly" | "yearly"): Date {
  const d = new Date(date.getTime());
  if (interval === "daily") {
    d.setDate(d.getDate() + 1);
  } else if (interval === "monthly") {
    const currentMonth = d.getMonth();
    d.setMonth(currentMonth + 1);
    // Handle overflow to next-next month (e.g. Jan 31 -> Feb 28/29)
    if (d.getMonth() !== (currentMonth + 1) % 12) {
      d.setDate(0); // Sets to the last day of the previous month
    }
  } else if (interval === "yearly") {
    const currentYear = d.getFullYear();
    d.setFullYear(currentYear + 1);
    // Handle leap year overflow
    if (d.getMonth() !== date.getMonth()) {
      d.setDate(0);
    }
  }
  return d;
}

function nominalDays(freq: "daily" | "monthly" | "yearly"): number {
  if (freq === "daily") return 1.0;
  if (freq === "monthly") return 365.2425 / 12.0;
  if (freq === "yearly") return 365.2425;
  return 1.0;
}

function compoundPeriodRate(
  rate: number,
  freq: "daily" | "monthly" | "yearly",
  compounding: "daily" | "monthly" | "yearly"
): number {
  return rate * (nominalDays(compounding) / nominalDays(freq));
}

export function accrueInterest(
  principal: number,
  interestType: "none" | "simple" | "compound",
  rate: number | null,
  freq: "daily" | "monthly" | "yearly" | null,
  compounding: "daily" | "monthly" | "yearly" | null,
  anchorDateStr: string,
  asOfStr: string
): number {
  // Use YYYY-MM-DD parsing safe for UTC to avoid local timezone offsets
  const parseDate = (str: string) => {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const anchorDate = parseDate(anchorDateStr);
  const asOf = parseDate(asOfStr);

  if (interestType === "none" || rate === null || freq === null || anchorDate >= asOf) {
    return 0.00;
  }

  if (interestType === "simple") {
    let tempDate = new Date(anchorDate.getTime());
    let fullPeriods = 0;

    while (true) {
      const nextDate = addInterval(tempDate, freq);
      if (nextDate <= asOf) {
        fullPeriods += 1;
        tempDate = nextDate;
      } else {
        break;
      }
    }

    const remainderDays = getDaysDiff(tempDate, asOf);
    const nextPeriodDate = addInterval(tempDate, freq);
    const periodLenDays = getDaysDiff(tempDate, nextPeriodDate);

    const periodsElapsed = fullPeriods + (remainderDays / (periodLenDays || 1));
    return Math.round(principal * (rate / 100.0) * periodsElapsed * 100) / 100;

  } else if (interestType === "compound") {
    if (!compounding) return 0.00;
    const r = compoundPeriodRate(rate, freq, compounding) / 100.0;
    let tempDate = new Date(anchorDate.getTime());
    let fullPeriods = 0;

    while (true) {
      const nextDate = addInterval(tempDate, compounding);
      if (nextDate <= asOf) {
        fullPeriods += 1;
        tempDate = nextDate;
      } else {
        break;
      }
    }

    const remainderDays = getDaysDiff(tempDate, asOf);
    const nextPeriodDate = addInterval(tempDate, compounding);
    const periodLenDays = getDaysDiff(tempDate, nextPeriodDate);

    const compoundedPrincipal = principal * Math.pow(1.0 + r, fullPeriods);
    const partial = compoundedPrincipal * r * (remainderDays / (periodLenDays || 1));
    return Math.round(((compoundedPrincipal + partial) - principal) * 100) / 100;
  }

  return 0.00;
}

export interface EstimateResult {
  outstanding: number;
  principal: number;
  unpaid_interest: number;
}

export function computeLoanLedger(
  loan: {
    principal_amount: string | number;
    interest_type: "none" | "simple" | "compound";
    interest_rate: string | number | null;
    interest_frequency: "daily" | "monthly" | "yearly" | null;
    compounding: "daily" | "monthly" | "yearly" | null;
    start_date: string;
    status: "ACTIVE" | "PAID";
    paid_off_date: string | null;
  },
  payments: Array<{
    amount: string | number;
    interest_component: string | number;
    principal_component: string | number;
    payment_date: string;
  }>,
  asOfStr: string
): EstimateResult {
  let calcDate = asOfStr;
  if (loan.status === "PAID" && loan.paid_off_date) {
    if (loan.paid_off_date < asOfStr) {
      calcDate = loan.paid_off_date;
    }
  }

  const pAmount = typeof loan.principal_amount === "string" ? parseFloat(loan.principal_amount) : loan.principal_amount;
  const iRate = loan.interest_rate !== null ? (typeof loan.interest_rate === "string" ? parseFloat(loan.interest_rate) : loan.interest_rate) : null;

  let principal = pAmount;
  let unpaidInterest = 0;
  let anchorDate = loan.start_date;

  const parsedPayments = payments.map(p => ({
    amount: typeof p.amount === "string" ? parseFloat(p.amount) : p.amount,
    interest_component: typeof p.interest_component === "string" ? parseFloat(p.interest_component) : p.interest_component,
    principal_component: typeof p.principal_component === "string" ? parseFloat(p.principal_component) : p.principal_component,
    payment_date: p.payment_date
  }));

  const activePayments = parsedPayments
    .filter(p => p.payment_date <= calcDate)
    .sort((a, b) => a.payment_date.localeCompare(b.payment_date));

  for (const p of activePayments) {
    const segmentInterest = accrueInterest(
      principal,
      loan.interest_type,
      iRate,
      loan.interest_frequency,
      loan.compounding,
      anchorDate,
      p.payment_date
    );
    unpaidInterest += segmentInterest;

    // Apply payment components
    unpaidInterest -= p.interest_component;
    principal -= p.principal_component;
    anchorDate = p.payment_date;
  }

  const segmentInterest = accrueInterest(
    principal,
    loan.interest_type,
    iRate,
    loan.interest_frequency,
    loan.compounding,
    anchorDate,
    calcDate
  );
  unpaidInterest += segmentInterest;

  return {
    outstanding: Math.round((principal + unpaidInterest) * 100) / 100,
    principal: Math.round(principal * 100) / 100,
    unpaid_interest: Math.round(unpaidInterest * 100) / 100,
  };
}

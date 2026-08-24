import { createClient } from "@/lib/supabase/server";

export type LoanParticipant = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  phone_number: string | null;
};

export type LoanLedgerSummary = {
  outstanding: string;
  principal_remaining: string;
  unpaid_interest: string;
  is_overdue: boolean;
  is_partially_paid: boolean;
  status: "ACTIVE" | "PAID";
};

export type LoanListItem = {
  id: string;
  principal_amount: string;
  interest_type: "none" | "simple" | "compound";
  interest_rate: string | null;
  interest_frequency: "daily" | "monthly" | "yearly" | null;
  compounding: "daily" | "monthly" | "yearly" | null;
  start_date: string;
  due_date: string;
  status: "ACTIVE" | "PAID";
  counterparty: { id: string; username: string; full_name: string | null };
  ledger: LoanLedgerSummary | null;
};

async function attachLedgers<T extends { id: string }>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  loans: T[],
): Promise<(T & { ledger: LoanLedgerSummary | null })[]> {
  return Promise.all(
    loans.map(async (loan) => {
      try {
        const { data } = await supabase.rpc("get_loan_ledger", { p_loan_id: loan.id });
        const ledger = Array.isArray(data) ? (data[0] as LoanLedgerSummary | undefined) ?? null : null;
        return { ...loan, ledger };
      } catch {
        return { ...loan, ledger: null };
      }
    }),
  );
}

export async function listLoans(userId: string, role: "lender" | "borrower"): Promise<LoanListItem[]> {
  const supabase = await createClient();

  const counterpartyRelation =
    role === "lender"
      ? "counterparty:profiles!borrower_id(id, username, full_name)"
      : "counterparty:profiles!lender_id(id, username, full_name)";

  const { data, error } = await supabase
    .from("loans")
    .select(
      `id, principal_amount, interest_type, interest_rate, interest_frequency, compounding, start_date, due_date, status, ${counterpartyRelation}`,
    )
    .eq(role === "lender" ? "lender_id" : "borrower_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  const rows = (data ?? []) as unknown as Omit<LoanListItem, "ledger">[];
  return attachLedgers(supabase, rows);
}

export type LoanDetail = LoanListItem & {
  lender: LoanParticipant;
  borrower: LoanParticipant;
  viewerRole: "lender" | "borrower";
  payments: Array<{
    id: string;
    payment_date: string;
    amount: string;
    interest_component: string;
    principal_component: string;
    overpaid_excess: string;
    note: string | null;
    payer_id: string;
    status?: "PENDING" | "CONFIRMED" | "REJECTED";
  }>;
};

export async function getLoanDetail(loanId: string, viewerId: string): Promise<LoanDetail | null> {
  const supabase = await createClient();

  const { data: loan, error } = await supabase
    .from("loans")
    .select(
      "id, principal_amount, interest_type, interest_rate, interest_frequency, compounding, start_date, due_date, status, lender_id, borrower_id",
    )
    .eq("id", loanId)
    .maybeSingle();

  if (error || !loan) {
    if (error) console.error("Error fetching loan detail:", error);
    return null;
  }

  const [{ data: lenderProfile }, { data: borrowerProfile }, { data: ledgerRows }, { data: payments }] =
    await Promise.all([
      supabase.rpc("get_profile_visible", { target_id: loan.lender_id }),
      supabase.rpc("get_profile_visible", { target_id: loan.borrower_id }),
      supabase.rpc("get_loan_ledger", { p_loan_id: loanId }),
      supabase
        .from("payments")
        .select("id, payment_date, amount, interest_component, principal_component, overpaid_excess, note, payer_id, status")
        .eq("loan_id", loanId)
        .order("payment_date", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

  const lender = (Array.isArray(lenderProfile) ? lenderProfile[0] : lenderProfile) as LoanParticipant;
  const borrower = (Array.isArray(borrowerProfile) ? borrowerProfile[0] : borrowerProfile) as LoanParticipant;
  const ledger = (Array.isArray(ledgerRows) ? ledgerRows[0] : ledgerRows) as LoanLedgerSummary | undefined;

  const viewerRole: "lender" | "borrower" = viewerId === loan.lender_id ? "lender" : "borrower";
  const counterparty = viewerRole === "lender" ? borrower : lender;

  return {
    id: loan.id,
    principal_amount: loan.principal_amount,
    interest_type: loan.interest_type,
    interest_rate: loan.interest_rate,
    interest_frequency: loan.interest_frequency,
    compounding: loan.compounding,
    start_date: loan.start_date,
    due_date: loan.due_date,
    status: loan.status,
    lender,
    borrower,
    viewerRole,
    counterparty: { id: counterparty?.id ?? "", username: counterparty?.username ?? "", full_name: counterparty?.full_name ?? null },
    ledger: ledger ?? null,
    payments: payments ?? [],
  };
}

export async function getDashboardAggregates(userId: string) {
  const [lent, borrowed] = await Promise.all([
    listLoans(userId, "lender"),
    listLoans(userId, "borrower"),
  ]);

  const sum = (loans: LoanListItem[]) =>
    loans.reduce((acc, l) => acc + Number(l.ledger?.outstanding ?? l.principal_amount), 0);

  const activeLent = lent.filter((l) => l.status === "ACTIVE");
  const activeBorrowed = borrowed.filter((l) => l.status === "ACTIVE");

  return {
    lent,
    borrowed,
    totalLent: sum(activeLent),
    totalBorrowed: sum(activeBorrowed),
    activeLentCount: activeLent.length,
    activeBorrowedCount: activeBorrowed.length,
    overdue: [...activeLent, ...activeBorrowed].filter((l) => l.ledger?.is_overdue),
    upcoming: [...activeLent, ...activeBorrowed].filter((l) => {
      if (l.ledger?.is_overdue) return false;
      const days = Math.round(
        (new Date(`${l.due_date}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000,
      );
      return days >= 0 && days <= 3;
    }),
  };
}

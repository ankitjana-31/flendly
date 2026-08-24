import { redirect } from "next/navigation";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";
import { AuthedShell } from "@/components/layout/authed-shell";
import { LoanListContainer, type LoanListItem } from "@/components/loans/loan-list-container";
import { computeLoanLedger } from "@/lib/interest/engine";

export default async function BorrowedPage() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  const supabase = await createClient();

  // Fetch unread notifications count
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);

  const unreadCount = count ?? 0;

  // Fetch loans where current user is the borrower
  const { data: rawLoans, error } = await supabase
    .from("loans")
    .select(`
      *,
      lender:profiles!lender_id (id, username, full_name, avatar_url),
      payments (*)
    `)
    .eq("borrower_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading borrowed loans:", error);
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const listItems: LoanListItem[] = (rawLoans || []).map((loan: any) => {
    // Calculate ledger calculations
    const ledger = computeLoanLedger(
      {
        principal_amount: loan.principal_amount,
        interest_type: loan.interest_type,
        interest_rate: loan.interest_rate,
        interest_frequency: loan.interest_frequency,
        compounding: loan.compounding,
        start_date: loan.start_date,
        status: loan.status,
        paid_off_date: loan.paid_off_date,
      },
      loan.payments || [],
      todayStr
    );

    // Derive status
    let derivedStatus: "active" | "partially-paid" | "overdue" | "paid" = "active";
    if (loan.status === "PAID") {
      derivedStatus = "paid";
    } else if (todayStr > loan.due_date) {
      derivedStatus = "overdue";
    } else if ((loan.payments || []).length > 0) {
      derivedStatus = "partially-paid";
    }

    // Format interest details
    let interestDesc = "No Interest";
    if (loan.interest_type !== "none" && loan.interest_rate) {
      const freq = loan.interest_frequency ? ` ${loan.interest_frequency}` : "";
      const type = loan.interest_type;
      const compound = loan.compounding && loan.interest_type === "compound" ? ` comp. ${loan.compounding}` : "";
      interestDesc = `${parseFloat(loan.interest_rate)}%${freq} ${type}${compound}`;
    }

    return {
      id: loan.id,
      principalAmount: parseFloat(loan.principal_amount),
      outstandingBalance: ledger.outstanding,
      interestDesc,
      startDate: loan.start_date,
      dueDate: loan.due_date,
      status: derivedStatus,
      counterparty: loan.lender,
    };
  });

  return (
    <AuthedShell profile={profile} unreadCount={unreadCount}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Borrowed Agreements
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Overview and ledger schedules of money you have borrowed from others.
          </p>
        </div>

        <LoanListContainer loans={listItems} type="borrowed" />
      </div>
    </AuthedShell>
  );
}

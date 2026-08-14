import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  Clock,
  ArrowRight,
  Bell
} from "lucide-react";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";
import { AuthedShell } from "@/components/layout/authed-shell";
import { computeLoanLedger } from "@/lib/interest/engine";
import { formatDistanceToNow, format } from "date-fns";

export default async function DashboardPage() {
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

  // 1. Fetch Lent Loans
  const { data: lentLoans } = await supabase
    .from("loans")
    .select(`
      *,
      borrower:profiles!borrower_id (id, username, full_name, avatar_url),
      payments (*)
    `)
    .eq("lender_id", user.id);

  // 2. Fetch Borrowed Loans
  const { data: borrowedLoans } = await supabase
    .from("loans")
    .select(`
      *,
      lender:profiles!lender_id (id, username, full_name, avatar_url),
      payments (*)
    `)
    .eq("borrower_id", user.id);

  // 3. Fetch Requests for Pending Actions Calculation
  const { data: rawRequests } = await supabase
    .from("loan_requests")
    .select(`
      id,
      status,
      sender_id,
      receiver_id,
      loan_offers (id, status, created_by)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  // 4. Fetch Recent Activity / Notifications
  const { data: recentNotifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const todayStr = new Date().toISOString().split("T")[0];

  let totalLent = 0;
  let activeLentCount = 0;
  let totalBorrowed = 0;
  let activeBorrowedCount = 0;

  const urgentLoans: any[] = [];

  // Walk Lent Loans
  (lentLoans || []).forEach((loan: any) => {
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

    if (loan.status === "ACTIVE") {
      totalLent += ledger.outstanding;
      activeLentCount++;

      if (ledger.outstanding > 0) {
        const diffTime = new Date(loan.due_date).getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) {
          urgentLoans.push({
            id: loan.id,
            counterparty: loan.borrower,
            outstanding: ledger.outstanding,
            dueDate: loan.due_date,
            diffDays,
            role: "lender",
          });
        }
      }
    }
  });

  // Walk Borrowed Loans
  (borrowedLoans || []).forEach((loan: any) => {
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

    if (loan.status === "ACTIVE") {
      totalBorrowed += ledger.outstanding;
      activeBorrowedCount++;

      if (ledger.outstanding > 0) {
        const diffTime = new Date(loan.due_date).getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) {
          urgentLoans.push({
            id: loan.id,
            counterparty: loan.lender,
            outstanding: ledger.outstanding,
            dueDate: loan.due_date,
            diffDays,
            role: "borrower",
          });
        }
      }
    }
  });

  // Calculate Pending Actions Count
  let pendingActionsCount = 0;
  (rawRequests || []).forEach((req: any) => {
    if (req.status === "PENDING" || req.status === "COUNTERED") {
      const activeOffer = req.loan_offers?.find((o: any) => o.status === "ACTIVE");
      if (activeOffer && activeOffer.created_by !== user.id) {
        pendingActionsCount++;
      }
    }
  });

  // Net balance
  const netBalance = totalLent - totalBorrowed;

  // Time based greeting
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";

  const getNotificationText = (notif: any) => {
    const payload = notif.payload || {};
    const amountStr = payload.amount ? `₹${parseFloat(payload.amount).toLocaleString("en-IN")}` : "";
    switch (notif.type) {
      case "new_request":
        return `New request proposal received for ${amountStr}.`;
      case "counter_offer":
        return `Counter-offer proposed for ${amountStr}.`;
      case "offer_accepted":
        return `Loan agreement activated for ${amountStr}.`;
      case "offer_declined":
        return `Proposal terms declined.`;
      case "payment_recorded":
        return `Payment of ${amountStr} was recorded.`;
      case "deadline_reminder":
        return `Repayment deadline is approaching soon.`;
      case "overdue":
        return `Loan repayment is overdue.`;
      case "fully_paid":
        return `Agreement fully settled!`;
      default:
        return "New activity on your account.";
    }
  };

  const getNotificationLink = (notif: any) => {
    const payload = notif.payload || {};
    if (payload.loan_id) return `/loans/${payload.loan_id}`;
    if (payload.request_id) return `/requests/${payload.request_id}`;
    return "/dashboard";
  };

  return (
    <AuthedShell profile={profile} unreadCount={unreadCount}>
      <div className="space-y-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Monly Overview
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl mt-0.5">
              {greeting}, {profile?.full_name?.split(" ")[0] || "User"}.
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Here is your active ledger summary for trust-based lending.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link
              href="/borrowed"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Record Payment
            </Link>
            <Link
              href="/requests/new"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 px-4 text-xs font-semibold text-white dark:text-zinc-950 transition-colors shadow-sm gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Request
            </Link>
          </div>
        </div>

        {/* Summary cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Lent */}
          <div className="bg-white dark:bg-[#1A1C23] border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-xl shadow-sm flex flex-col justify-between h-28">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Lent</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                ₹{totalLent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">
              {activeLentCount} active lent agreements
            </span>
          </div>

          {/* Card 2: Total Borrowed */}
          <div className="bg-white dark:bg-[#1A1C23] border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-xl shadow-sm flex flex-col justify-between h-28">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Borrowed</span>
              <span className="text-xl font-bold text-zinc-700 dark:text-zinc-300 font-mono mt-1 block">
                ₹{totalBorrowed.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">
              {activeBorrowedCount} active borrowed agreements
            </span>
          </div>

          {/* Card 3: Net Balance */}
          <div className="bg-white dark:bg-[#1A1C23] border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-xl shadow-sm flex flex-col justify-between h-28">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Net Balance</span>
              <span className={`text-xl font-bold font-mono mt-1 block ${netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-650 dark:text-red-400"}`}>
                {netBalance >= 0 ? "+" : ""}₹{netBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">
              Overall ledger position
            </span>
          </div>

          {/* Card 4: Pending Actions */}
          <div className="bg-white dark:bg-[#1A1C23] border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-xl shadow-sm flex flex-col justify-between h-28">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Pending Actions</span>
              <span className={`text-xl font-bold mt-1 block ${pendingActionsCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-zinc-400"}`}>
                {pendingActionsCount}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">
              Proposals requiring response
            </span>
          </div>
        </div>

        {/* Urgent and Activity Col Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Urgent and Quick links */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-zinc-400" />
              Upcoming Repayments
            </h3>

            {urgentLoans.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-[#1A1C23] border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl">
                <p className="text-xs text-zinc-500">No loans are currently due within 3 days or overdue.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentLoans.map((loan) => {
                  const isOverdue = loan.diffDays < 0;
                  return (
                    <div
                      key={loan.id}
                      className={`bg-white dark:bg-[#1A1C23] border p-4 rounded-xl flex items-center justify-between flex-wrap gap-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 ${
                        isOverdue
                          ? "border-red-200 dark:border-red-950/40 bg-red-50/10"
                          : "border-zinc-200/60 dark:border-zinc-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {loan.counterparty?.username.substring(0, 2)}
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                            {loan.role === "lender" ? `Owed by @${loan.counterparty?.username}` : `Owed to @${loan.counterparty?.username}`}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">
                            {loan.counterparty?.full_name || "Monly User"}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block text-right font-sans">Outstanding</span>
                          <span className="font-bold text-zinc-900 dark:text-white">
                            ₹{loan.outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block font-sans">Due Date</span>
                          <span className={isOverdue ? "text-red-650 dark:text-red-400 font-bold" : "text-zinc-700 dark:text-zinc-300 font-medium"}>
                            {isOverdue ? `Overdue (${Math.abs(loan.diffDays)}d)` : `In ${loan.diffDays} days`}
                          </span>
                        </div>
                        <Link
                          href={`/loans/${loan.id}`}
                          className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Col: Recent Activity feed */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Bell className="h-4.5 w-4.5 text-zinc-400" />
              Recent Activity
            </h3>

            <div className="bg-white dark:bg-[#1A1C23] border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-4 divide-y divide-zinc-100 dark:divide-zinc-800/50 shadow-sm">
              {recentNotifications && recentNotifications.length > 0 ? (
                recentNotifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={getNotificationLink(notif)}
                    className="block py-3.5 first:pt-0 last:pb-0 group"
                  >
                    <div className="flex justify-between items-start gap-2 text-xs">
                      <p className="text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-100 leading-snug">
                        {getNotificationText(notif)}
                      </p>
                      {!notif.read_at && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 block mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-zinc-500">No activity yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthedShell>
  );
}

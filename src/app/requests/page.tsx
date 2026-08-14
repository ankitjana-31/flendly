import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";
import { AuthedShell } from "@/components/layout/authed-shell";
import { formatDistanceToNow, format } from "date-fns";
import type { DBLoanRequest } from "@/lib/types";

export default async function RequestsPage() {
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

  // Fetch requests involving the user
  const { data: rawRequests, error } = await supabase
    .from("loan_requests")
    .select(`
      id,
      direction,
      status,
      created_at,
      updated_at,
      sender_id,
      receiver_id,
      sender:profiles!sender_id (id, username, full_name, avatar_url),
      receiver:profiles!receiver_id (id, username, full_name, avatar_url),
      loan_offers (
        id,
        amount,
        interest_type,
        interest_rate,
        interest_frequency,
        compounding,
        deadline,
        message,
        status,
        created_by,
        created_at
      )
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error loading requests:", error);
  }

  const allRequests = (rawRequests as unknown as DBLoanRequest[]) || [];

  // Categorize incoming vs outgoing
  const incoming = allRequests.filter((r) => r.receiver_id === user.id);
  const outgoing = allRequests.filter((r) => r.sender_id === user.id);

  const renderRequestList = (list: typeof allRequests, emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12 bg-white dark:bg-[#1A1C23] border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
          <Link
            href="/requests/new"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 px-4 text-xs font-semibold text-white dark:text-zinc-950 transition-colors"
          >
            Create Proposal
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((req) => {
          const isSender = req.sender_id === user.id;
          const counterparty = isSender ? req.receiver : req.sender;
          const activeOffer = req.loan_offers.find((o) => o.status === "ACTIVE") || req.loan_offers[0];

          // Determine the user's role and direction
          // direction is from perspectives of sender_id
          const isLend = req.direction === "lend";
          const userAction = isSender
            ? isLend ? "Lending to" : "Borrowing from"
            : isLend ? "Borrowing from" : "Lending to";

          const amountVal = activeOffer ? parseFloat(activeOffer.amount) : 0;
          const interestDesc = activeOffer
            ? activeOffer.interest_type === "none"
              ? "No Interest"
              : `${activeOffer.interest_rate}% ${activeOffer.interest_type}`
            : "No Interest";

          const statusColors: Record<string, string> = {
            PENDING: "bg-blue-50 text-blue-700 ring-1 ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400",
            COUNTERED: "bg-amber-50 text-amber-700 ring-1 ring-amber-700/10 dark:bg-amber-900/20 dark:text-amber-400",
            ACCEPTED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-700/10 dark:bg-emerald-900/20 dark:text-emerald-400",
            DECLINED: "bg-red-50 text-red-700 ring-1 ring-red-700/10 dark:bg-red-900/20 dark:text-red-400",
            CANCELLED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
          };

          return (
            <Link
              key={req.id}
              href={`/requests/${req.id}`}
              className="group block bg-white dark:bg-[#1A1C23] border border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold uppercase shrink-0">
                    {counterparty?.username.substring(0, 2) || "U"}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      {userAction}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-zinc-950 dark:group-hover:text-zinc-100 mt-0.5">
                      {counterparty?.full_name || "Monly User"}
                    </h4>
                    <p className="text-xs text-zinc-500">@{counterparty?.username}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[req.status] || "bg-zinc-100 text-zinc-800"}`}>
                  {req.status.toLowerCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800/50 pt-4 mt-4">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Proposed Amount</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                    ₹{amountVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Interest Rate</span>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {interestDesc}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 mt-4 border-t border-zinc-50 dark:border-zinc-800/30 pt-3">
                <span>Updated {formatDistanceToNow(new Date(req.updated_at), { addSuffix: true })}</span>
                {activeOffer?.deadline && (
                  <span>Due {format(new Date(activeOffer.deadline), "PP")}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <AuthedShell profile={profile} unreadCount={unreadCount}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Requests
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              Track, counter, and accept loan requests and terms negotiation.
            </p>
          </div>
          <Link
            href="/requests/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 px-4 text-xs font-semibold text-white dark:text-zinc-950 transition-colors shadow-sm gap-1"
          >
            <Plus className="h-4 w-4" />
            New Request
          </Link>
        </div>

        {/* CSS-based tab navigation */}
        <div className="space-y-6">
          <div className="border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Incoming Requests</h2>
            {renderRequestList(incoming, "You have no incoming loan requests requiring attention.")}
          </div>

          <div className="pt-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Outgoing Requests</h2>
            {renderRequestList(outgoing, "You have no active outgoing loan requests.")}
          </div>
        </div>
      </div>
    </AuthedShell>
  );
}

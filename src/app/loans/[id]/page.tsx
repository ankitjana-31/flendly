import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";
import { AuthedShell } from "@/components/layout/authed-shell";
import { LoanDetailsContainer } from "@/components/loans/loan-details-container";
import type { LoanLedger } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LoanDetailPage({ params }: PageProps) {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  const { id: loanId } = await params;
  const supabase = await createClient();

  // Fetch unread notifications count
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);

  const unreadCount = count ?? 0;

  // Fetch authoritative ledger details using Postgres RPC
  const { data: rawLedger, error } = await supabase.rpc("get_loan_ledger", {
    p_loan_id: loanId,
  });

  if (error || !rawLedger) {
    console.error("Error loading loan ledger from RPC:", error);
    redirect("/dashboard");
  }

  const ledger = rawLedger as unknown as LoanLedger;

  // Check authorization (user must be lender or borrower)
  if (ledger.lender_id !== user.id && ledger.borrower_id !== user.id) {
    redirect("/dashboard");
  }

  // Fetch lender and borrower profile summaries
  const { data: lender } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .eq("id", ledger.lender_id)
    .single();

  const { data: borrower } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .eq("id", ledger.borrower_id)
    .single();

  if (!lender || !borrower) {
    console.error("Failed to load loan participant profiles");
    redirect("/dashboard");
  }

  const isLender = ledger.lender_id === user.id;
  const backHref = isLender ? "/lent" : "/borrowed";
  const backLabel = isLender ? "Back to Lent" : "Back to Borrowed";

  return (
    <AuthedShell profile={profile} unreadCount={unreadCount}>
      <div className="space-y-6">
        {/* Back navigation & Header */}
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            className="p-2 -ml-2 rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </div>

        {/* Dynamic content */}
        <LoanDetailsContainer
          ledger={ledger}
          lender={lender as any}
          borrower={borrower as any}
          currentUserId={user.id}
        />
      </div>
    </AuthedShell>
  );
}

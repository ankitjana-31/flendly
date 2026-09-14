import { redirect } from "next/navigation";

import { LinkButton } from "@/components/ui/button";
import { LoanListCard } from "@/components/loans/loan-list-card";
import { RetroWindow } from "@/components/ui/retro-window";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { listLoans } from "@/lib/loans/queries";
import { formatMoney } from "@/lib/format";
import { ArrowDownLeft, Plus } from "lucide-react";

export default async function BorrowedPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const loans = await listLoans(user.id, "borrower");
  const active = loans.filter((l) => l.status === "ACTIVE");
  const paid = loans.filter((l) => l.status === "PAID");

  const totalActiveBorrowed = active.reduce(
    (sum, l) => sum + (Number(l.ledger?.outstanding ?? l.principal_amount) || 0),
    0,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-16 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black/10 dark:border-white/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F43F5E]">
            <span>[PAYABLES]</span>
            <span className="text-gray-400">//</span>
            <span className="text-gray-600 dark:text-gray-300 uppercase">MONEY YOU BORROWED</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight mt-1">
            Money You&apos;ve Borrowed
          </h1>
        </div>

        <LinkButton href="/requests/new" size="md">
          <Plus className="w-4 h-4" />
          <span>NEW BORROW REQUEST</span>
        </LinkButton>
      </div>

      {/* Summary Window */}
      <RetroWindow
        title="BORROWED LIABILITIES // ACTIVE DEBT"
        subtitle={`${active.length} active counterparties`}
        colorBar="pink"
        glow={true}
        className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[6px_6px_0_0_#000000]"
        contentClassName="p-5 sm:p-6"
        headerRight={
          <span className="px-2.5 py-0.5 border border-black bg-[#F43F5E] text-white font-mono text-[11px] font-black uppercase">
            ACTIVE TOTAL: {formatMoney(totalActiveBorrowed)}
          </span>
        }
      >
        {loans.length === 0 ? (
          <div className="border-[2px] border-dashed border-black/30 dark:border-white/30 p-10 text-center bg-[#FAF8F5] dark:bg-[#1E212D]">
            <div className="w-10 h-10 border-[2px] border-black bg-[#F43F5E] text-white flex items-center justify-center mx-auto mb-3 font-bold">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <h3 className="font-mono text-base font-bold text-black dark:text-white uppercase">
              You haven&apos;t borrowed anything yet
            </h3>
            <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              Need financial support with mutual agreements? Send a borrow request to friends.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10">
                  <h2 className="text-xs sm:text-sm font-black text-black dark:text-white uppercase tracking-wider">
                    ACTIVE BORROWINGS ({active.length})
                  </h2>
                  <span className="text-xs text-[#F43F5E] font-bold">
                    {formatMoney(totalActiveBorrowed)} to repay
                  </span>
                </div>
                <div className="grid gap-3">
                  {active.map((loan) => (
                    <LoanListCard key={loan.id} loan={loan} role="borrower" />
                  ))}
                </div>
              </section>
            )}

            {paid.length > 0 && (
              <section className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10">
                  <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider">
                    SETTLED & CLEARED ({paid.length})
                  </h2>
                </div>
                <div className="grid gap-3 opacity-80">
                  {paid.map((loan) => (
                    <LoanListCard key={loan.id} loan={loan} role="borrower" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </RetroWindow>
    </div>
  );
}

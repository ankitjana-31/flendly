import { redirect } from "next/navigation";

import { LinkButton } from "@/components/ui/button";
import { LoanListCard } from "@/components/loans/loan-list-card";
import { RetroWindow } from "@/components/ui/retro-window";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { listLoans } from "@/lib/loans/queries";
import { formatMoney } from "@/lib/format";
import { ArrowUpRight, Plus } from "lucide-react";

export default async function LentPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const loans = await listLoans(user.id, "lender");
  const active = loans.filter((l) => l.status === "ACTIVE");
  const paid = loans.filter((l) => l.status === "PAID");

  const totalActiveLent = active.reduce(
    (sum, l) => sum + (Number(l.ledger?.outstanding ?? l.principal_amount) || 0),
    0,
  );

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-16 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black/10 dark:border-white/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#059669] dark:text-[#2DD4BF]">
            <span>[RECEIVABLES]</span>
            <span className="text-gray-400">//</span>
            <span className="text-gray-600 dark:text-gray-300 uppercase">MONEY GIVEN OUT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight mt-1">
            Money You&apos;ve Lent
          </h1>
        </div>

        <LinkButton href="/requests/new" size="md">
          <Plus className="w-4 h-4" />
          <span>NEW LOAN REQUEST</span>
        </LinkButton>
      </div>

      {/* Summary Window */}
      <RetroWindow
        title="LENT PORTFOLIO // ACTIVE DEALS"
        subtitle={`${active.length} active borrowers`}
        colorBar="blue"
        glow={true}
        className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[6px_6px_0_0_#000000]"
        contentClassName="p-5 sm:p-6"
        headerRight={
          <span className="px-2.5 py-0.5 border border-black bg-[#2DD4BF] text-black font-mono text-[11px] font-black uppercase">
            ACTIVE TOTAL: {formatMoney(totalActiveLent)}
          </span>
        }
      >
        {loans.length === 0 ? (
          <div className="border-[2px] border-dashed border-black/30 dark:border-white/30 p-10 text-center bg-[#FAF8F5] dark:bg-[#1E212D]">
            <div className="w-10 h-10 border-[2px] border-black bg-[#2DD4BF] text-black flex items-center justify-center mx-auto mb-3 font-bold">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <h3 className="font-mono text-base font-bold text-black dark:text-white uppercase">
              You haven&apos;t lent anyone money yet
            </h3>
            <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              Ready to send cash to a friend with crystal clear terms? Initiate a loan request above.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10">
                  <h2 className="text-xs sm:text-sm font-black text-black dark:text-white uppercase tracking-wider">
                    ACTIVE LOANS ({active.length})
                  </h2>
                  <span className="text-xs text-[#059669] dark:text-[#2DD4BF] font-bold">
                    {formatMoney(totalActiveLent)} outstanding
                  </span>
                </div>
                <div className="grid gap-3">
                  {active.map((loan) => (
                    <LoanListCard key={loan.id} loan={loan} role="lender" />
                  ))}
                </div>
              </section>
            )}

            {paid.length > 0 && (
              <section className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10">
                  <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider">
                    SETTLED & PAID OFF ({paid.length})
                  </h2>
                </div>
                <div className="grid gap-3 opacity-80">
                  {paid.map((loan) => (
                    <LoanListCard key={loan.id} loan={loan} role="lender" />
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

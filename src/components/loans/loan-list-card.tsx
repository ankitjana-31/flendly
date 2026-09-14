import Link from "next/link";

import { StatusBadge, loanDisplayStatus } from "@/components/ui/status-badge";
import { formatMoney, formatDate, interestSummary } from "@/lib/format";
import type { LoanListItem } from "@/lib/loans/queries";
import { Calendar, User, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export function LoanListCard({ loan, role = "lender" }: { loan: LoanListItem; role?: "lender" | "borrower" }) {
  const isLender = role === "lender";
  const outstanding = loan.ledger?.outstanding ?? loan.principal_amount;

  return (
    <Link
      href={`/loans/${loan.id}`}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] text-black dark:text-white shadow-[3px_3px_0_0_#000] hover:bg-[#FFE600] hover:text-black dark:hover:bg-[#FFE600] dark:hover:text-black hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000] transition-all font-mono"
    >
      <div className="flex items-center gap-3.5">
        <div className={`w-10 h-10 border-[2px] border-black flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-[2px_2px_0_0_#000] ${
          isLender ? "bg-[#2DD4BF] text-black" : "bg-[#F43F5E] text-white"
        }`}>
          {isLender ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-base sm:text-lg font-black tracking-tight">
            {loan.counterparty.full_name ?? `@${loan.counterparty.username}`}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-bold mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{interestSummary(loan)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Due {formatDate(loan.due_date)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-black/10 dark:border-white/10">
        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400 block font-bold">
            {isLender ? "To Collect" : "To Repay"}
          </span>
          <p className={`font-mono text-lg sm:text-xl font-black ${
            isLender ? "text-[#059669] dark:text-[#2DD4BF]" : "text-[#F43F5E]"
          }`}>
            {formatMoney(outstanding)}
          </p>
        </div>
        <StatusBadge status={loanDisplayStatus(loan)} />
      </div>
    </Link>
  );
}

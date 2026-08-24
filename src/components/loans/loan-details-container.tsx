"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, FileText, ArrowLeft, Plus, DollarSign, Clock, ShieldCheck, Sparkles, Percent } from "lucide-react";
import { format } from "date-fns";
import { LoanLedgerTable } from "./loan-ledger-table";
import { PaymentModal } from "./payment-modal";
import type { LoanLedger } from "@/lib/types";

interface ProfileSummary {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface LoanDetailsContainerProps {
  ledger: LoanLedger;
  lender: ProfileSummary;
  borrower: ProfileSummary;
  currentUserId: string;
}

export function LoanDetailsContainer({
  ledger,
  lender,
  borrower,
  currentUserId,
}: LoanDetailsContainerProps) {
  const router = useRouter();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const isLender = ledger.lender_id === currentUserId;
  const isBorrower = ledger.borrower_id === currentUserId;

  const totalPaid = (ledger.payments || []).reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  const totalPrincipalRepaid = ledger.principal_amount - ledger.principal;
  const repaymentPercentage = ledger.principal_amount > 0 
    ? Math.min(100, Math.max(0, (totalPrincipalRepaid / ledger.principal_amount) * 100))
    : 0;

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-blue-50 text-blue-700 ring-1 ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400",
    PAID: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-700/10 dark:bg-emerald-900/20 dark:text-emerald-400",
    OVERDUE: "bg-red-50 text-red-700 ring-1 ring-red-700/10 dark:bg-red-900/20 dark:text-red-400",
  };

  // Derive active vs overdue status for UI display
  const todayStr = new Date().toISOString().split("T")[0];
  const isOverdue = ledger.status === "ACTIVE" && todayStr > ledger.due_date;
  const displayStatus = isOverdue ? "OVERDUE" : ledger.status;

  const handlePaymentSuccess = () => {
    router.refresh();
  };

  const formatInterest = () => {
    if (ledger.interest_type === "none") return "No Interest";
    const freq = ledger.interest_frequency ? ` ${ledger.interest_frequency}` : "";
    const type = ledger.interest_type;
    const compound = ledger.compounding && ledger.interest_type === "compound" ? ` comp. ${ledger.compounding}` : "";
    return `${ledger.interest_rate}%${freq} ${type}${compound}`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner Card */}
      <div className="bg-white dark:bg-[#1A1C23] border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3 w-full md:w-auto">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Outstanding Balance</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColors[displayStatus] || "bg-zinc-100 text-zinc-800"}`}>
                {displayStatus.toLowerCase()}
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono mt-1">
              ₹{ledger.outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h2>
          </div>

          {/* Repayment Progress bar */}
          <div className="space-y-1 max-w-sm">
            <div className="flex justify-between text-xs text-zinc-500 font-medium">
              <span>Repaid {repaymentPercentage.toFixed(0)}% of principal</span>
              <span>₹{totalPrincipalRepaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })} / ₹{ledger.principal_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-zinc-900 dark:bg-zinc-50 h-full rounded-full transition-all duration-500"
                style={{ width: `${repaymentPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick actions for Borrower */}
        {isBorrower && ledger.status === "ACTIVE" && (
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full md:w-auto h-11 inline-flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 px-6 text-sm font-semibold text-white dark:text-zinc-950 transition-colors shadow-sm gap-2"
          >
            <Plus className="h-4.5 w-4.5" />
            Record Payment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Contractual Terms Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1A1C23] border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-400" />
              Contractual Terms
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50 space-y-3 text-xs">
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-500 font-medium">Principal Amount</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono">
                  ₹{ledger.principal_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 pt-3">
                <span className="text-zinc-500 font-medium">Interest Terms</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {formatInterest()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 pt-3">
                <span className="text-zinc-500 font-medium">Accrued Interest</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">
                  ₹{ledger.unpaid_interest.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 pt-3">
                <span className="text-zinc-500 font-medium">Start Date</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {format(new Date(ledger.start_date), "PP")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 pt-3">
                <span className="text-zinc-500 font-medium">Due Date / Deadline</span>
                <span className={`font-bold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-zinc-800 dark:text-zinc-200"}`}>
                  {format(new Date(ledger.due_date), "PP")}
                </span>
              </div>
            </div>
          </div>

          {/* Party details */}
          <div className="bg-white dark:bg-[#1A1C23] border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Participants</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold uppercase shrink-0">
                  {lender.username.substring(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Lender</span>
                  <p className="font-semibold text-zinc-850 dark:text-zinc-200 truncate">{lender.full_name || "Monly User"}</p>
                  <p className="text-zinc-500 truncate">@{lender.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800/50 pt-3">
                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold uppercase shrink-0">
                  {borrower.username.substring(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Borrower</span>
                  <p className="font-semibold text-zinc-850 dark:text-zinc-200 truncate">{borrower.full_name || "Monly User"}</p>
                  <p className="text-zinc-500 truncate">@{borrower.username}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Ledger Timeline Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Agreement Ledger Ledger</h3>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
              {ledger.payments.length} Payments Recorded
            </span>
          </div>

          <LoanLedgerTable
            loan={ledger as any}
            payments={ledger.payments as any}
            borrowerName={borrower.full_name || `@${borrower.username}`}
          />
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          loan={{
            id: ledger.loan_id,
            principal_amount: ledger.principal_amount,
            interest_type: ledger.interest_type,
            interest_rate: ledger.interest_rate,
            interest_frequency: ledger.interest_frequency,
            compounding: ledger.compounding,
            start_date: ledger.start_date,
            status: ledger.status,
            paid_off_date: null,
            borrower_id: ledger.borrower_id,
          }}
          payments={ledger.payments as any}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

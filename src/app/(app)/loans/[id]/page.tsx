import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";

import { RetroWindow } from "@/components/ui/retro-window";
import { StatusBadge, loanDisplayStatus } from "@/components/ui/status-badge";
import { RecordPaymentSection } from "@/components/loans/record-payment-section";
import { PaymentConfirmActions } from "@/components/loans/payment-actions";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { getLoanDetail } from "@/lib/loans/queries";
import { formatMoney, formatDate, interestSummary } from "@/lib/format";
import type { LoanTerms, PaymentRecord } from "@/lib/interest/engine";

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const loan = await getLoanDetail(id, user.id);
  if (!loan) notFound();
  if (loan.lender.id !== user.id && loan.borrower.id !== user.id) notFound();

  const isLender = loan.viewerRole === "lender";
  const totalOutstanding = Number(loan.ledger?.outstanding ?? loan.principal_amount);

  // Compute pending payments sum to prevent duplicate payment submissions
  const pendingPaymentsSum = loan.payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const maxPayable = Math.max(0, totalOutstanding - pendingPaymentsSum);

  const terms: LoanTerms = {
    principalAmount: loan.principal_amount,
    interestType: loan.interest_type,
    interestRate: loan.interest_rate,
    interestFrequency: loan.interest_frequency,
    compounding: loan.compounding,
    startDate: loan.start_date,
    dueDate: loan.due_date,
    paidOffDate: loan.status === "PAID" ? loan.payments[loan.payments.length - 1]?.payment_date ?? null : null,
  };

  const existingPayments: PaymentRecord[] = loan.payments
    .filter((p) => p.status !== "REJECTED")
    .map((p) => ({
      amount: p.amount,
      paymentDate: p.payment_date,
    }));

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-16 font-mono">
      {/* Top Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black/10 dark:border-white/20 pb-4">
        <div>
          <Link
            href={isLender ? "/lent" : "/borrowed"}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white uppercase mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO {isLender ? "LENT PORTFOLIO" : "BORROWED LIABILITIES"}</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 border border-black font-black text-xs uppercase ${
              isLender ? "bg-[#2DD4BF] text-black" : "bg-[#FFE600] text-black"
            }`}>
              {isLender ? "YOU ARE LENDER" : "YOU ARE BORROWER"}
            </span>
            <span className="text-gray-400">//</span>
            <span className="text-gray-600 dark:text-gray-300 text-xs font-bold uppercase">
              {loan.counterparty.full_name ?? `@${loan.counterparty.username}`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight mt-1">
            {isLender ? "Lent to " : "Borrowed from "} {loan.counterparty.full_name ?? `@${loan.counterparty.username}`}
          </h1>
        </div>

        <StatusBadge status={loanDisplayStatus(loan)} />
      </div>

      {/* Main Loan Metrics Window */}
      <RetroWindow
        title={`LOAN RECORD // ${loan.id.slice(0, 8).toUpperCase()}`}
        subtitle={`${interestSummary(loan)} · Due ${formatDate(loan.due_date)}`}
        colorBar={isLender ? "pink" : "yellow"}
        glow={true}
        className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[6px_6px_0_0_#000000]"
        contentClassName="p-5 sm:p-6"
        headerRight={
          <span className={`px-2.5 py-0.5 border border-black font-mono text-[11px] font-black uppercase ${
            isLender ? "bg-[#2DD4BF] text-black" : "bg-[#FFE600] text-black"
          }`}>
            OUTSTANDING: {formatMoney(loan.ledger?.outstanding ?? loan.principal_amount)}
          </span>
        }
      >
        <div className="space-y-6">
          {/* Financial Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D]">
              <span className="text-[10px] uppercase text-gray-500 font-bold block">Remaining Principal</span>
              <p className="text-2xl font-black text-black dark:text-white mt-0.5">
                {formatMoney(loan.ledger?.principal_remaining ?? loan.principal_amount)}
              </p>
            </div>

            <div className="p-4 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D]">
              <span className="text-[10px] uppercase text-gray-500 font-bold block">Accrued Unpaid Interest</span>
              <p className="text-2xl font-black text-black dark:text-white mt-0.5">
                {formatMoney(loan.ledger?.unpaid_interest ?? "0")}
              </p>
            </div>

            <div className="p-4 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D]">
              <span className="text-[10px] uppercase text-gray-500 font-bold block">Total Outstanding</span>
              <p className={`text-2xl font-black mt-0.5 ${
                isLender ? "text-[#059669] dark:text-[#2DD4BF]" : "text-[#F43F5E]"
              }`}>
                {formatMoney(totalOutstanding.toString())}
              </p>
            </div>
          </div>

          {/* Dates & Terms Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-[2px] border-black/20 dark:border-white/20 bg-[#FAF8F5] dark:bg-[#1E212D] text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Started: <strong className="text-black dark:text-white">{formatDate(loan.start_date)}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Due Date: <strong className="text-black dark:text-white">{formatDate(loan.due_date)}</strong></span>
            </div>
            <div>
              <span>Terms: <strong className="text-black dark:text-white">{interestSummary(loan)}</strong></span>
            </div>
          </div>

          {/* Repayment Form (Only for Borrower when loan is active) */}
          {loan.status === "ACTIVE" && loan.viewerRole === "borrower" && (
            <div className="pt-2 border-t border-black/10 dark:border-white/10">
              <RecordPaymentSection
                loanId={loan.id}
                terms={terms}
                existingPayments={existingPayments}
                pendingAmount={pendingPaymentsSum}
                maxPayable={maxPayable}
              />
            </div>
          )}
        </div>
      </RetroWindow>

      {/* Payment Audit History Window */}
      <RetroWindow
        title="PAYMENT AUDIT LOG // CONFIRMED & PENDING"
        subtitle={`${loan.payments.length} transactions logged`}
        colorBar="blue"
        className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[6px_6px_0_0_#000000]"
        contentClassName="p-5 sm:p-6"
      >
        {loan.payments.length === 0 ? (
          <div className="border-[2px] border-dashed border-black/30 dark:border-white/30 p-8 text-center bg-[#FAF8F5] dark:bg-[#1E212D]">
            <p className="text-xs text-gray-500 uppercase font-bold">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...loan.payments].reverse().map((p) => {
              const status = p.status ?? "CONFIRMED";
              const isPending = status === "PENDING";
              const isRejected = status === "REJECTED";

              return (
                <div
                  key={p.id}
                  className={`p-4 border-[2px] border-black dark:border-white/40 shadow-[2px_2px_0_0_#000] flex flex-col gap-2.5 ${
                    isPending
                      ? "bg-[#FFE600]/20 dark:bg-[#2E2800] border-l-[6px] border-l-[#FFE600]"
                      : isRejected
                      ? "bg-[#F43F5E]/10 dark:bg-[#3D0C1D] opacity-75"
                      : "bg-[#FAF8F5] dark:bg-[#1E212D]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-black dark:text-white">
                          {formatMoney(p.amount)}
                        </span>
                        <span className={`px-2 py-0.5 border border-black text-[10px] font-black uppercase ${
                          isPending
                            ? "bg-[#FFE600] text-black"
                            : isRejected
                            ? "bg-[#F43F5E] text-white"
                            : "bg-[#2DD4BF] text-black"
                        }`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatDate(p.payment_date)} · Interest component {formatMoney(p.interest_component)} · Principal component {formatMoney(p.principal_component)}
                        {Number(p.overpaid_excess) > 0 && ` · Excess ${formatMoney(p.overpaid_excess)}`}
                      </p>
                      {p.note && (
                        <p className="text-xs text-gray-700 dark:text-gray-300 italic mt-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          &quot;{p.note}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Lender Confirmation Actions for Pending Payments */}
                  {isPending && isLender && (
                    <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Review Payment:</span>
                      <PaymentConfirmActions paymentId={p.id} loanId={loan.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </RetroWindow>
    </div>
  );
}

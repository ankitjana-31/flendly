"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Decimal from "decimal.js";
import { Check, AlertTriangle, Calendar, FileText, IndianRupee } from "lucide-react";

import { recordPaymentAction, type PaymentActionState } from "@/lib/payments/actions";
import { previewPayment, type LoanTerms, type PaymentRecord } from "@/lib/interest/engine";
import { formatMoney, todayIso } from "@/lib/format";

const initialState: PaymentActionState = {};

export function PaymentForm({
  loanId,
  terms,
  existingPayments,
  pendingAmount = 0,
  maxPayable,
  onDone,
}: {
  loanId: string;
  terms: LoanTerms;
  existingPayments: PaymentRecord[];
  pendingAmount?: number;
  maxPayable?: number;
  onDone?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(recordPaymentAction, initialState);
  const [amount, setAmount] = useState(maxPayable && maxPayable > 0 ? String(maxPayable) : "");
  const [paymentDate, setPaymentDate] = useState(todayIso());

  const preview = useMemo(() => {
    if (!amount || Number(amount) <= 0) return null;
    try {
      return previewPayment(terms, existingPayments, new Decimal(amount), paymentDate);
    } catch {
      return null;
    }
  }, [amount, paymentDate, terms, existingPayments]);

  useEffect(() => {
    if (state.success && onDone) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const isBlocked = maxPayable !== undefined && maxPayable <= 0;

  if (isBlocked) {
    return (
      <div className="p-4 border-[2.5px] border-black bg-[#FFE600] text-black font-mono shadow-[3px_3px_0_0_#000]">
        <div className="flex items-center gap-2 font-black text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>PAYMENT ALREADY PENDING CONFIRMATION</span>
        </div>
        <p className="text-xs font-bold mt-1.5 leading-relaxed">
          You currently have ₹{pendingAmount.toFixed(2)} in pending payment requests awaiting confirmation from the lender. You cannot submit another payment until the previous one is confirmed or rejected.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 font-mono p-4 sm:p-5 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000]">
      <input type="hidden" name="loanId" value={loanId} />

      {pendingAmount > 0 && (
        <div className="p-2.5 border-[2px] border-black bg-[#FFE600]/30 text-black text-xs font-bold flex items-center gap-2">
          <span>ℹ</span>
          <span>
            Note: ₹{pendingAmount.toFixed(2)} is already pending. Max you can record now is ₹{(maxPayable ?? 0).toFixed(2)}.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase text-black dark:text-white flex items-center gap-1" htmlFor="payment-amount">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Amount (₹)</span>
          </label>
          <input
            id="payment-amount"
            name="amount"
            type="number"
            min="0.01"
            max={maxPayable && maxPayable > 0 ? maxPayable : undefined}
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-10 w-full border-[2px] border-black bg-white dark:bg-[#161821] px-3 text-sm font-bold text-black dark:text-white outline-none focus:bg-[#FEF08A] focus:text-black"
            placeholder="1000"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase text-black dark:text-white flex items-center gap-1" htmlFor="payment-date">
            <Calendar className="w-3.5 h-3.5" />
            <span>Payment Date</span>
          </label>
          <input
            id="payment-date"
            name="paymentDate"
            type="date"
            required
            min={terms.startDate}
            max={terms.dueDate > todayIso() ? terms.dueDate : todayIso()}
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="h-10 w-full border-[2px] border-black bg-white dark:bg-[#161821] px-3 text-sm font-bold text-black dark:text-white outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase text-black dark:text-white flex items-center gap-1" htmlFor="payment-note">
          <FileText className="w-3.5 h-3.5" />
          <span>Note / UPI Reference (Optional)</span>
        </label>
        <input
          id="payment-note"
          name="note"
          type="text"
          maxLength={500}
          placeholder="e.g. Paid via Google Pay UPI"
          className="h-10 w-full border-[2px] border-black bg-white dark:bg-[#161821] px-3 text-sm font-bold text-black dark:text-white outline-none"
        />
      </div>

      {preview && (
        <div className="border-[2px] border-black/20 dark:border-white/20 bg-white dark:bg-[#161821] p-3 text-xs space-y-1">
          <p className="font-bold text-gray-500 uppercase text-[10px]">Estimated Split Breakdown:</p>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Towards Interest:</span>
            <span className="font-bold text-black dark:text-white">{formatMoney(preview.interestCoverage.toString())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Towards Principal:</span>
            <span className="font-bold text-black dark:text-white">{formatMoney(preview.principalReduction.toString())}</span>
          </div>
          <div className="flex justify-between border-t border-black/10 dark:border-white/10 pt-1 font-black">
            <span>New Remaining Outstanding:</span>
            <span className="text-[#059669] dark:text-[#2DD4BF]">{formatMoney(preview.projectedOutstanding.toString())}</span>
          </div>
        </div>
      )}

      {state.error && (
        <div className="p-2.5 border-[2px] border-[#F43F5E] bg-[#FF2E93]/15 text-[#9F1239] dark:text-[#FDA4AF] text-xs font-bold">
          ⚠️ {state.error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="px-4 py-2 border-[2px] border-black bg-white dark:bg-[#1E212D] text-black dark:text-white text-xs font-bold uppercase hover:bg-gray-100 cursor-pointer"
          >
            CANCEL
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 border-[2px] border-black bg-[#2DD4BF] text-black text-xs font-black uppercase shadow-[2px_2px_0_0_#000] hover:bg-teal-300 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isPending ? "RECORDING..." : "COMMIT PAYMENT"}</span>
        </button>
      </div>
    </form>
  );
}

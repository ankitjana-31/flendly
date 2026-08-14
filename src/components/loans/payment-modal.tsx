"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, DollarSign, MessageSquare, AlertCircle } from "lucide-react";
import { computeLoanLedger } from "@/lib/interest/engine";
import { recordPaymentAction } from "@/lib/loans/actions";

interface PaymentModalProps {
  loan: {
    id: string;
    principal_amount: string | number;
    interest_type: "none" | "simple" | "compound";
    interest_rate: string | number | null;
    interest_frequency: "daily" | "monthly" | "yearly" | null;
    compounding: "daily" | "monthly" | "yearly" | null;
    start_date: string;
    status: "ACTIVE" | "PAID";
    paid_off_date: string | null;
    borrower_id: string;
  };
  payments: Array<{
    amount: string | number;
    interest_component: string | number;
    principal_component: string | number;
    payment_date: string;
  }>;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ loan, payments, onClose, onSuccess }: PaymentModalProps) {
  const [amount, setAmount] = useState<number | "">("");
  const [paymentDate, setPaymentDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Estimates state
  const [estimates, setEstimates] = useState<{
    outstandingBefore: number;
    interestComponent: number;
    principalComponent: number;
    overpaidExcess: number;
    newOutstanding: number;
  } | null>(null);

  useEffect(() => {
    if (!amount || amount <= 0 || !paymentDate) {
      setEstimates(null);
      return;
    }

    try {
      // Calculate outstanding before payment as of the selected payment date
      const before = computeLoanLedger(loan, payments, paymentDate);
      
      const interestComponent = Math.min(amount, before.unpaid_interest);
      const principalComponent = Math.min(amount - interestComponent, before.principal);
      const overpaidExcess = Math.max(0, amount - interestComponent - principalComponent);
      
      const newOutstanding = Math.max(0, before.outstanding - (interestComponent + principalComponent));

      setEstimates({
        outstandingBefore: before.outstanding,
        interestComponent,
        principalComponent,
        overpaidExcess,
        newOutstanding,
      });
    } catch (err) {
      console.error("Estimation calculation failed:", err);
    }
  }, [amount, paymentDate, loan, payments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError("Please enter an amount greater than zero.");
      return;
    }

    setPending(true);
    setError(null);

    const res = await recordPaymentAction({
      loanId: loan.id,
      amount,
      paymentDate,
      note: note.trim() || null,
    });

    setPending(false);
    if (res.error) {
      setError(res.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1A1C23] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xl z-10 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 px-6 py-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Record Payment</h2>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-500 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div className="space-y-1.5">
            <label htmlFor="paymentAmount" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Payment Amount (₹)
            </label>
            <div className="relative rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-100 overflow-hidden">
              <span className="absolute left-3 top-2.5 text-zinc-400 font-semibold text-sm">₹</span>
              <input
                id="paymentAmount"
                type="number"
                step="0.01"
                min="0.01"
                required
                disabled={pending}
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                placeholder="0.00"
                className="h-10 w-full bg-transparent pl-8 pr-3 text-sm text-zinc-900 dark:text-white outline-none font-mono"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label htmlFor="paymentDate" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Payment Date
            </label>
            <div className="relative rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-100 overflow-hidden">
              <span className="absolute left-3 top-2.5 text-zinc-400">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                id="paymentDate"
                type="date"
                required
                disabled={pending}
                max={new Date().toISOString().split("T")[0]}
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="h-10 w-full bg-transparent pl-9 pr-3 text-sm text-zinc-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label htmlFor="paymentNote" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Note (Optional)
            </label>
            <div className="relative rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-100 overflow-hidden">
              <span className="absolute left-3 top-2.5 text-zinc-400">
                <MessageSquare className="h-4 w-4" />
              </span>
              <input
                id="paymentNote"
                type="text"
                disabled={pending}
                maxLength={200}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Recorded bank transfer"
                className="h-10 w-full bg-transparent pl-9 pr-3 text-sm text-zinc-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Estimates Live Box */}
          {estimates && (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200/50 dark:border-zinc-800/50 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Current Outstanding</span>
                <span className="font-semibold font-mono text-zinc-700 dark:text-zinc-300">
                  ₹{estimates.outstandingBefore.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Interest Allocation</span>
                <span className="font-semibold font-mono text-zinc-700 dark:text-zinc-300">
                  +₹{estimates.interestComponent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Principal Reduction</span>
                <span className="font-semibold font-mono text-zinc-700 dark:text-zinc-300">
                  +₹{estimates.principalComponent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {estimates.overpaidExcess > 0 && (
                <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  <span>Overpaid Excess</span>
                  <span className="font-mono">
                    +₹{estimates.overpaidExcess.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-2 flex items-center justify-between text-sm font-bold">
                <span className="text-zinc-900 dark:text-white">Projected Outstanding</span>
                <span className="font-mono text-zinc-900 dark:text-white">
                  ₹{estimates.newOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic mt-1 text-center">
                Final allocation is computed authoritatively by the server upon submission.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-3 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 px-4 text-sm font-semibold text-white dark:text-zinc-950 transition-colors disabled:opacity-50"
          >
            {pending ? "Recording..." : "Confirm Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}

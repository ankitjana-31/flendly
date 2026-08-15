"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Decimal from "decimal.js";

import { Button } from "@/components/ui/button";
import { recordPaymentAction, type PaymentActionState } from "@/lib/payments/actions";
import { previewPayment, type LoanTerms, type PaymentRecord } from "@/lib/interest/engine";
import { formatMoney, todayIso } from "@/lib/format";

const initialState: PaymentActionState = {};

export function PaymentForm({
  loanId,
  terms,
  existingPayments,
  onDone,
}: {
  loanId: string;
  terms: LoanTerms;
  existingPayments: PaymentRecord[];
  onDone?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(recordPaymentAction, initialState);
  const [amount, setAmount] = useState("");
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

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-border bg-muted/50 p-4">
      <input type="hidden" name="loanId" value={loanId} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="payment-amount">
          Amount (₹)
        </label>
        <input
          id="payment-amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
          placeholder="1000"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="payment-date">
          Payment date
        </label>
        <input
          id="payment-date"
          name="paymentDate"
          type="date"
          required
          max={todayIso()}
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="payment-note">
          Note (optional)
        </label>
        <input
          id="payment-note"
          name="note"
          type="text"
          maxLength={500}
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
        />
      </div>

      {preview && (
        <div className="rounded-lg bg-background p-3 text-sm">
          <p className="text-muted-foreground">Estimated split (final figures confirmed on submit):</p>
          <div className="mt-1.5 flex justify-between">
            <span>Towards interest</span>
            <span className="font-tabular">{formatMoney(preview.interestCoverage.toString())}</span>
          </div>
          <div className="flex justify-between">
            <span>Towards principal</span>
            <span className="font-tabular">{formatMoney(preview.principalReduction.toString())}</span>
          </div>
          {preview.overpaidExcess.gt(0) && (
            <div className="flex justify-between text-warning">
              <span>Overpaid</span>
              <span className="font-tabular">{formatMoney(preview.overpaidExcess.toString())}</span>
            </div>
          )}
          <div className="mt-1.5 flex justify-between border-t border-border pt-1.5 font-medium">
            <span>New outstanding</span>
            <span className="font-tabular">{formatMoney(preview.projectedOutstanding.toString())}</span>
          </div>
        </div>
      )}

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? "Recording…" : "Record payment"}
      </Button>
    </form>
  );
}

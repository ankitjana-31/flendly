"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { confirmPaymentAction, rejectPaymentAction } from "@/lib/payments/actions";

export function PaymentConfirmActions({
  paymentId,
  loanId,
}: {
  paymentId: string;
  loanId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-2 flex items-center gap-2">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await confirmPaymentAction(paymentId, loanId);
          });
        }}
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
      >
        {isPending ? "Updating..." : "Confirm Received"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await rejectPaymentAction(paymentId, loanId);
          });
        }}
        className="text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        Reject
      </Button>
    </div>
  );
}

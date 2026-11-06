"use client";

import { useState, useTransition } from "react";
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
  const [actionType, setActionType] = useState<"confirm" | "reject" | null>(null);

  return (
    <div className="mt-2 flex items-center gap-2">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => {
          setActionType("confirm");
          startTransition(async () => {
            await confirmPaymentAction(paymentId, loanId);
          });
        }}
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
      >
        {isPending && actionType === "confirm" ? "Confirming..." : "Confirm Received"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => {
          setActionType("reject");
          startTransition(async () => {
            await rejectPaymentAction(paymentId, loanId);
          });
        }}
        className="text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        {isPending && actionType === "reject" ? "Rejecting..." : "Reject"}
      </Button>
    </div>
  );
}

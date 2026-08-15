"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PaymentForm } from "@/components/loans/payment-form";
import type { LoanTerms, PaymentRecord } from "@/lib/interest/engine";

export function RecordPaymentSection({
  loanId,
  terms,
  existingPayments,
}: {
  loanId: string;
  terms: LoanTerms;
  existingPayments: PaymentRecord[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        Record a payment
      </Button>
    );
  }

  return (
    <PaymentForm
      loanId={loanId}
      terms={terms}
      existingPayments={existingPayments}
      onDone={() => {
        setOpen(false);
        router.refresh();
      }}
    />
  );
}

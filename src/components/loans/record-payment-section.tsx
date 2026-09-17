"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, IndianRupee } from "lucide-react";

import { PaymentForm } from "@/components/loans/payment-form";
import type { LoanTerms, PaymentRecord } from "@/lib/interest/engine";

export function RecordPaymentSection({
  loanId,
  terms,
  existingPayments,
  pendingAmount = 0,
  maxPayable,
}: {
  loanId: string;
  terms: LoanTerms;
  existingPayments: PaymentRecord[];
  pendingAmount?: number;
  maxPayable?: number;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 border-[2px] border-black bg-[#FFE600] text-black font-mono text-xs sm:text-sm font-black uppercase shadow-[3px_3px_0_0_#000] hover:bg-yellow-300 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1.5 transition-all"
      >
        <IndianRupee className="w-4 h-4" />
        <span>RECORD REPAYMENT</span>
      </button>
    );
  }

  return (
    <PaymentForm
      loanId={loanId}
      terms={terms}
      existingPayments={existingPayments}
      pendingAmount={pendingAmount}
      maxPayable={maxPayable}
      onDone={() => {
        setOpen(false);
        router.refresh();
      }}
    />
  );
}

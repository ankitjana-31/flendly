"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, X } from "lucide-react";

import { OfferTermsFields } from "@/components/negotiation/offer-terms-fields";
import { counterOfferAction, type ActionState } from "@/lib/requests/actions";
import type { OfferHistoryItem } from "@/lib/requests/queries";

const initialState: ActionState = {};

export function CounterOfferForm({
  requestId,
  currentOffer,
  onCancel,
}: {
  requestId: string;
  currentOffer: OfferHistoryItem;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(counterOfferAction, initialState);

  // When counter offer is submitted successfully, close form and refresh page
  useEffect(() => {
    if (state.success) {
      onCancel();
      router.refresh();
    }
  }, [state.success, onCancel, router]);

  return (
    <form action={formAction} className="flex flex-col gap-5 p-4 sm:p-6 border-[2.5px] border-black bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[4px_4px_0_0_#000] font-mono">
      <div className="flex items-center justify-between border-b-[2px] border-black dark:border-white/20 pb-2.5">
        <span className="text-xs font-black uppercase text-black dark:text-white flex items-center gap-1.5">
          <span>⚡</span>
          <span>CONFIGURE COUNTER-PROPOSAL</span>
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="w-5 h-5 border border-black bg-white text-black font-bold flex items-center justify-center hover:bg-gray-200"
        >
          ✕
        </button>
      </div>

      <input type="hidden" name="requestId" value={requestId} />

      <OfferTermsFields
        defaults={{
          amount: currentOffer.amount,
          interestType: currentOffer.interest_type,
          interestRate: currentOffer.interest_rate ?? undefined,
          interestFrequency: currentOffer.interest_frequency ?? undefined,
          compounding: currentOffer.compounding ?? undefined,
          deadline: currentOffer.deadline,
        }}
      />

      {state.error && (
        <div className="p-2.5 border-[2px] border-[#F43F5E] bg-[#FF2E93]/15 text-[#9F1239] dark:text-[#FDA4AF] text-xs font-bold">
          ⚠️ {state.error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-black/10 dark:border-white/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 border-[2px] border-black bg-white dark:bg-[var(--muted)] text-black dark:text-white text-xs sm:text-sm font-bold uppercase shadow-[2px_2px_0_0_#000] hover:bg-gray-100 cursor-pointer"
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 border-[2px] border-black bg-[#FFE600] text-black text-xs sm:text-sm font-black uppercase shadow-[3px_3px_0_0_#000] hover:bg-yellow-300 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
          <span>{isPending ? "DISPATCHING..." : "SUBMIT COUNTER-OFFER"}</span>
        </button>
      </div>
    </form>
  );
}

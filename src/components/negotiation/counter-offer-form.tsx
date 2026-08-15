"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
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
  const [state, formAction, isPending] = useActionState(counterOfferAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-xl border border-border bg-muted/50 p-4">
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
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? "Sending…" : "Send counter"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

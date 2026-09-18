"use client";

import { useState, useTransition } from "react";
import { Check, X, Undo2, ArrowLeftRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CounterOfferForm } from "@/components/negotiation/counter-offer-form";
import {
  acceptOfferAction,
  cancelRequestAction,
  declineRequestAction,
} from "@/lib/requests/actions";
import type { OfferHistoryItem, RequestDetail } from "@/lib/requests/queries";

export function RequestActions({
  request,
  activeOffer,
  viewerId,
}: {
  request: RequestDetail;
  activeOffer: OfferHistoryItem;
  viewerId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showCounter, setShowCounter] = useState(false);

  const isOfferCreator = activeOffer.created_by === viewerId;
  const isSender = request.sender.id === viewerId;
  // Respondent is the user who did not create the latest active offer
  const canRespond = !isOfferCreator;

  if (showCounter) {
    return (
      <CounterOfferForm
        requestId={request.id}
        currentOffer={activeOffer}
        onCancel={() => setShowCounter(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 font-mono">
      {error && (
        <div className="p-2.5 border-[2px] border-[#F43F5E] bg-[#FF2E93]/15 text-[#9F1239] dark:text-[#FDA4AF] text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Recipient Actions (Accept / Counter / Decline) */}
        {canRespond && (
          <>
            <button
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const res = await acceptOfferAction(activeOffer.id, request.id);
                  if (res?.error) setError(res.error);
                })
              }
              className="px-4 py-2 border-[2px] border-black bg-[#2DD4BF] text-black text-xs sm:text-sm font-black uppercase shadow-[2px_2px_0_0_#000] hover:bg-teal-300 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isPending ? "PROCESSING..." : "ACCEPT OFFER"}</span>
            </button>

            <button
              disabled={isPending}
              onClick={() => setShowCounter(true)}
              className="px-4 py-2 border-[2px] border-black bg-[#FFE600] text-black text-xs sm:text-sm font-black uppercase shadow-[2px_2px_0_0_#000] hover:bg-yellow-300 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
              <span>COUNTER-OFFER</span>
            </button>

            <button
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  if (!confirm("Are you sure you want to decline this proposal?")) return;
                  const res = await declineRequestAction(request.id);
                  if (res?.error) setError(res.error);
                })
              }
              className="px-3.5 py-2 border-[2px] border-black bg-white dark:bg-[var(--muted)] text-[#F43F5E] text-xs sm:text-sm font-bold uppercase shadow-[2px_2px_0_0_#000] hover:bg-[#F43F5E] hover:text-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>DECLINE</span>
            </button>
          </>
        )}

        {/* Sender Actions: ONLY show Cancel Request if the viewer sent the request / created the offer */}
        {isSender && (
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                if (!confirm("Are you sure you want to cancel this request?")) return;
                const res = await cancelRequestAction(request.id);
                if (res?.error) setError(res.error);
              })
            }
            className="px-3.5 py-2 border-[2px] border-black bg-[#F43F5E] text-white text-xs sm:text-sm font-bold uppercase shadow-[2px_2px_0_0_#000] hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" />
            <span>CANCEL REQUEST</span>
          </button>
        )}
      </div>
    </div>
  );
}

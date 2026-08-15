"use client";

import { useState, useTransition } from "react";

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
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {canRespond && (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await acceptOfferAction(activeOffer.id, request.id);
                if (res?.error) setError(res.error);
              })
            }
          >
            Accept
          </Button>
        )}
        {canRespond && (
          <Button size="sm" variant="outline" onClick={() => setShowCounter(true)} disabled={isPending}>
            Counter
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const res = await declineRequestAction(request.id);
              if (res?.error) setError(res.error);
            })
          }
        >
          Decline
        </Button>
        {isSender && (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await cancelRequestAction(request.id);
                if (res?.error) setError(res.error);
              })
            }
          >
            Cancel request
          </Button>
        )}
      </div>
    </div>
  );
}

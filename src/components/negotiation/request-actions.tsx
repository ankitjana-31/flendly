"use client";

import { useState, useTransition } from "react";
import { Check, X, Undo2, ArrowLeftRight, Clock, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CounterOfferForm } from "@/components/negotiation/counter-offer-form";
import { RetroConfirmModal } from "@/components/ui/retro-confirm-modal";
import {
  acceptOfferAction,
  cancelRequestAction,
  declineRequestAction,
} from "@/lib/requests/actions";
import { calculateApprovalWindow } from "@/lib/requests/approval-window";
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
  const [confirmModal, setConfirmModal] = useState<{
    type: "cancel" | "decline";
    title: string;
    message: string;
    confirmLabel: string;
    action: () => Promise<any>;
  } | null>(null);

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

  const approvalInfo = calculateApprovalWindow({
    created_at: activeOffer.created_at,
    deadline: activeOffer.deadline,
  });

  const isExpired = approvalInfo.isExpired;

  if (isExpired || request.status === "CANCELLED") {
    return (
      <div className="p-3 sm:p-3.5 border-[2px] border-[#F43F5E] bg-[#FF2E93]/15 text-[#9F1239] dark:text-[#FDA4AF] font-mono text-xs font-bold rounded-[12px] flex items-center gap-2 shadow-[2px_2px_0_0_#000]">
        <span className="text-base shrink-0">⚠️</span>
        <div>
          <span className="font-black uppercase block">Proposal Expired / Cancelled</span>
          <span className="text-[11px] font-sans">
            This request was not confirmed within the {approvalInfo.approvalHours}h approval deadline and has been auto-cancelled.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* Approval Deadline Timer Banner */}
      <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-[10px] border-[2px] border-black dark:border-white/30 bg-[#FEF08A] dark:bg-[#2A2408] text-black dark:text-yellow-200 text-xs font-bold shadow-[2px_2px_0_0_#000]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-black dark:text-yellow-300 stroke-[2.5]" />
          <span>
            APPROVAL WINDOW: <span className="font-black">{approvalInfo.countdownText}</span>
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-[4px] border border-black bg-white dark:bg-black font-black uppercase text-black dark:text-yellow-300">
          MAX {approvalInfo.approvalHours}H
        </span>
      </div>

      {error && (
        <div className="p-2.5 border-[2px] border-[#F43F5E] bg-[#FF2E93]/15 text-[#9F1239] dark:text-[#FDA4AF] text-xs font-bold rounded-[12px]">
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
              className="px-4 py-2 rounded-[12px] border-[2px] border-black bg-[#2DD4BF] text-black text-xs sm:text-sm font-black uppercase shadow-[2px_2px_0_0_#000] hover:bg-teal-300 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isPending ? "PROCESSING..." : "ACCEPT OFFER"}</span>
            </button>

            <button
              disabled={isPending}
              onClick={() => setShowCounter(true)}
              className="px-4 py-2 rounded-[12px] border-[2px] border-black bg-[#FFE600] text-black text-xs sm:text-sm font-black uppercase shadow-[2px_2px_0_0_#000] hover:bg-yellow-300 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
              <span>COUNTER-OFFER</span>
            </button>

            <button
              disabled={isPending}
              onClick={() => {
                setConfirmModal({
                  type: "decline",
                  title: "DECLINE PROPOSAL",
                  message: "Are you sure you want to decline this proposal? This will close the negotiation.",
                  confirmLabel: "YES, DECLINE",
                  action: () => declineRequestAction(request.id),
                });
              }}
              className="px-3.5 py-2 rounded-[12px] border-[2px] border-black bg-white dark:bg-[var(--muted)] text-[#F43F5E] text-xs sm:text-sm font-bold uppercase shadow-[2px_2px_0_0_#000] hover:bg-[#F43F5E] hover:text-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
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
            onClick={() => {
              setConfirmModal({
                type: "cancel",
                title: "CANCEL REQUEST",
                message: "Are you sure you want to cancel this request? All active negotiations will be voided.",
                confirmLabel: "YES, CANCEL",
                action: () => cancelRequestAction(request.id),
              });
            }}
            className="px-3.5 py-2 rounded-[12px] border-[2px] border-black bg-[#F43F5E] text-white text-xs sm:text-sm font-bold uppercase shadow-[2px_2px_0_0_#000] hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" />
            <span>CANCEL REQUEST</span>
          </button>
        )}
      </div>

      {/* Aesthetic Neo-Brutalist Confirmation Modal */}
      {confirmModal && (
        <RetroConfirmModal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          cancelLabel="KEEP PROPOSAL"
          variant="danger"
          isPending={isPending}
          onConfirm={() => {
            const currentAction = confirmModal.action;
            setConfirmModal(null);
            startTransition(async () => {
              const res = await currentAction();
              if (res?.error) setError(res.error);
            });
          }}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

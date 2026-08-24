"use client";

import React from "react";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowRight, MessageSquare, Calendar, Percent, ShieldCheck } from "lucide-react";
import type { LoanOffer, LoanRequest } from "@/lib/types";

interface NegotiationTimelineProps {
  offers: LoanOffer[];
  request: LoanRequest;
  currentUserId: string;
  senderName: string;
  receiverName: string;
  onAccept?: (offerId: string) => void;
  onDecline?: () => void;
  onCounter?: (activeOffer: LoanOffer) => void;
  onCancel?: () => void;
  pending?: boolean;
}

export function NegotiationTimeline({
  offers,
  request,
  currentUserId,
  senderName,
  receiverName,
  onAccept,
  onDecline,
  onCounter,
  onCancel,
  pending = false,
}: NegotiationTimelineProps) {
  // Sort offers by created_at chronologically (oldest first)
  const sortedOffers = [...offers].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const activeOffer = offers.find((o) => o.status === "ACTIVE");
  const isCreatorOfActiveOffer = activeOffer?.created_by === currentUserId;
  const isRequestSender = request.sender_id === currentUserId;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400";
      case "ACCEPTED":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-700/10 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "DECLINED":
        return "bg-red-50 text-red-700 ring-1 ring-red-700/10 dark:bg-red-900/20 dark:text-red-400";
      case "SUPERSEDED":
        return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
      default:
        return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  const formatInterest = (offer: LoanOffer) => {
    if (offer.interest_type === "none") return "No Interest";
    const frequency = offer.interest_frequency ? ` ${offer.interest_frequency}` : "";
    const comp = offer.compounding && offer.interest_type === "compound" ? ` compounded ${offer.compounding}` : "";
    return `${offer.interest_rate}%${frequency} ${offer.interest_type}${comp}`;
  };

  return (
    <div className="space-y-8">
      {/* Visual Direction Banner */}
      <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="text-center flex-1">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Lender</div>
          <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
            {request.direction === "lend" ? senderName : receiverName}
          </div>
        </div>
        <div className="px-4 flex flex-col items-center">
          <ArrowRight className="h-5 w-5 text-zinc-400" />
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-1">
            {request.direction === "lend" ? "is lending to" : "is borrowing from"}
          </span>
        </div>
        <div className="text-center flex-1">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Borrower</div>
          <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
            {request.direction === "lend" ? receiverName : senderName}
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 space-y-6">
        {sortedOffers.map((offer, index) => {
          const isOwnOffer = offer.created_by === currentUserId;
          const authorName = offer.created_by === request.sender_id ? senderName : receiverName;

          return (
            <div key={offer.id} className="relative pl-6">
              {/* Timeline dot */}
              <div
                className={`absolute -left-2.5 top-1.5 h-5 w-5 rounded-full border-4 border-[#FBFBFA] dark:border-[#121316] flex items-center justify-center ${
                  offer.status === "ACTIVE"
                    ? "bg-blue-500"
                    : offer.status === "ACCEPTED"
                    ? "bg-emerald-500"
                    : offer.status === "DECLINED"
                    ? "bg-red-500"
                    : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              />

              {/* Offer Card */}
              <div className="bg-white dark:bg-[#1A1C23] border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {isOwnOffer ? "You" : authorName} proposed
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(offer.status)}`}>
                    {offer.status.toLowerCase()}
                  </span>
                </div>

                {/* Terms Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Amount</span>
                    <p className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                      ₹{parseFloat(offer.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Interest Terms</span>
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5 text-zinc-400" />
                      {formatInterest(offer)}
                    </p>
                  </div>
                  <div className="space-y-0.5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Due Date / Deadline</span>
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      {format(new Date(offer.deadline), "PP")}
                    </p>
                  </div>
                </div>

                {offer.message && (
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 border border-zinc-200/30 dark:border-zinc-800/30 flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <MessageSquare className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                    <p className="italic">&ldquo;{offer.message}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer if request status is open (PENDING or COUNTERED) */}
      {(request.status === "PENDING" || request.status === "COUNTERED") && activeOffer && (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              {isCreatorOfActiveOffer ? "Waiting for response..." : "Your turn to respond"}
            </h3>
            <p className="text-xs text-zinc-500">
              {isCreatorOfActiveOffer
                ? "The counterparty needs to accept, decline, or counter this proposal."
                : "You can accept, decline, or suggest alternative loan terms."}
            </p>
          </div>

          <div className="flex gap-2">
            {isCreatorOfActiveOffer ? (
              // Creator of active offer can CANCEL the request
              onCancel && (
                <button
                  onClick={onCancel}
                  disabled={pending}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-50"
                >
                  Cancel Request
                </button>
              )
            ) : (
              // Recipient of active offer can Accept, Decline, or Counter
              <>
                {onDecline && (
                  <button
                    onClick={onDecline}
                    disabled={pending}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 dark:border-red-950/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                )}
                {onCounter && (
                  <button
                    onClick={() => onCounter(activeOffer)}
                    disabled={pending}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-50"
                  >
                    Counter
                  </button>
                )}
                {onAccept && (
                  <button
                    onClick={() => onAccept(activeOffer.id)}
                    disabled={pending}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-4 text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Accept Terms
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

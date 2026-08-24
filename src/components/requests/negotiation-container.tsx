"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NegotiationTimeline } from "./negotiation-timeline";
import { InterestSelector } from "./interest-selector";
import {
  acceptOfferAction,
  declineRequestAction,
  cancelRequestAction,
  counterOfferAction
} from "@/lib/requests/actions";
import { AlertCircle, ArrowLeft, Send, X } from "lucide-react";
import type { DBLoanRequest, DBRequestOffer } from "@/lib/types";

interface NegotiationContainerProps {
  request: DBLoanRequest;
  offers: DBRequestOffer[];
  currentUserId: string;
  senderName: string;
  receiverName: string;
}

export function NegotiationContainer({
  request,
  offers,
  currentUserId,
  senderName,
  receiverName,
}: NegotiationContainerProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Counter offer state
  const [isCountering, setIsCountering] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [interestType, setInterestType] = useState<"none" | "simple" | "compound">("none");
  const [interestRate, setInterestRate] = useState<number | "">("");
  const [interestFrequency, setInterestFrequency] = useState<"daily" | "monthly" | "yearly">("monthly");
  const [compounding, setCompounding] = useState<"daily" | "monthly" | "yearly">("monthly");
  const [deadline, setDeadline] = useState("");
  const [note, setNote] = useState("");

  const activeOffer = offers.find((o) => o.status === "ACTIVE");

  const handleAccept = async (offerId: string) => {
    if (!confirm("Are you sure you want to accept these terms? This will create an legally binding agreement and generate a loan ledger.")) {
      return;
    }
    setPending(true);
    setError(null);
    const res = await acceptOfferAction(offerId, request.id);
    setPending(false);
    if (res.error) {
      setError(res.error);
    } else if (res.loanId) {
      router.push(`/loans/${res.loanId}`);
    }
  };

  const handleDecline = async () => {
    if (!confirm("Are you sure you want to decline this request proposal?")) {
      return;
    }
    setPending(true);
    setError(null);
    const res = await declineRequestAction(request.id);
    setPending(false);
    if (res.error) {
      setError(res.error);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this request?")) {
      return;
    }
    setPending(true);
    setError(null);
    const res = await cancelRequestAction(request.id);
    setPending(false);
    if (res.error) {
      setError(res.error);
    }
  };

  const handleCounterInit = (offer: DBRequestOffer) => {
    setAmount(parseFloat(offer.amount));
    setInterestType(offer.interest_type);
    setInterestRate(offer.interest_rate ? parseFloat(offer.interest_rate) : "");
    setInterestFrequency(offer.interest_frequency || "monthly");
    setCompounding(offer.compounding || "monthly");
    setDeadline(offer.deadline);
    setNote("");
    setIsCountering(true);
    setError(null);
  };

  const handleCounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    if (interestType !== "none" && (interestRate === "" || interestRate < 0)) {
      setError("Please enter a valid interest rate.");
      return;
    }
    if (!deadline) {
      setError("Please select a due date.");
      return;
    }
    if (new Date(deadline) <= new Date()) {
      setError("Due date must be in the future.");
      return;
    }

    setPending(true);
    setError(null);

    const res = await counterOfferAction(request.id, {
      amount,
      interestType,
      interestRate: interestType === "none" ? null : (interestRate as number),
      interestFrequency: interestType === "none" ? null : interestFrequency,
      compounding: interestType === "compound" ? compounding : null,
      deadline,
      message: note.trim() || null,
    });

    setPending(false);

    if (res.error) {
      setError(res.error);
    } else {
      setIsCountering(false);
      // Timeline and request are revalidated by Server Action
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="font-bold">Error</h5>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Negotiation Timeline */}
      <NegotiationTimeline
        offers={offers as any}
        request={request as any}
        currentUserId={currentUserId}
        senderName={senderName}
        receiverName={receiverName}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onCounter={handleCounterInit}
        onCancel={handleCancel}
        pending={pending}
      />

      {/* Expanded Counter Offer Form (Inline overlay or expansion card) */}
      {isCountering && activeOffer && (
        <div className="bg-white dark:bg-[#1A1C23] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8 shadow-md space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Propose Counter-Offer</h3>
              <p className="text-xs text-zinc-500 mt-1">Adjust terms to submit your alternative proposal.</p>
            </div>
            <button
              onClick={() => setIsCountering(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-500 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <form onSubmit={handleCounterSubmit} className="space-y-6">
            {/* Principal Amount */}
            <div className="space-y-1.5">
              <label htmlFor="counterAmount" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Principal Amount (₹)
              </label>
              <div className="relative rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-100 overflow-hidden">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-semibold text-sm">₹</span>
                <input
                  id="counterAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="h-10 w-full bg-transparent pl-8 pr-3 text-sm text-zinc-900 dark:text-white outline-none font-mono"
                />
              </div>
            </div>

            {/* Interest Selector */}
            <InterestSelector
              interestType={interestType}
              setInterestType={setInterestType}
              interestRate={interestRate}
              setInterestRate={setInterestRate}
              interestFrequency={interestFrequency}
              setInterestFrequency={setInterestFrequency}
              compounding={compounding}
              setCompounding={setCompounding}
            />

            {/* Due Date */}
            <div className="space-y-1.5">
              <label htmlFor="counterDeadline" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Due Date / Repayment Deadline
              </label>
              <div className="relative rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-100 overflow-hidden">
                <input
                  id="counterDeadline"
                  type="date"
                  required
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="h-10 w-full bg-transparent px-3 text-sm text-zinc-900 dark:text-white outline-none"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label htmlFor="counterNote" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Personal Note / Message
              </label>
              <textarea
                id="counterNote"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                placeholder="Explain why you're proposing these terms..."
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
              <button
                type="button"
                onClick={() => setIsCountering(false)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 px-4 text-xs font-semibold text-white dark:text-zinc-950 transition-colors shadow-sm gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                {pending ? "Submitting..." : "Submit Counter Proposal"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

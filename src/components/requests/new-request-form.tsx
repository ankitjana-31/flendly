"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserSearchCombobox } from "@/components/users/user-search-combobox";
import { InterestSelector } from "./interest-selector";
import { createRequestAction } from "@/lib/requests/actions";
import { AlertCircle, User, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { VisibleProfile } from "@/lib/types";

interface NewRequestFormProps {
  initialRecipient: VisibleProfile | null;
}

export function NewRequestForm({ initialRecipient }: NewRequestFormProps) {
  const router = useRouter();
  const [recipient, setRecipient] = useState<VisibleProfile | null>(initialRecipient);
  const [direction, setDirection] = useState<"lend" | "borrow">("borrow");
  const [amount, setAmount] = useState<number | "">("");
  const [interestType, setInterestType] = useState<"none" | "simple" | "compound">("none");
  const [interestRate, setInterestRate] = useState<number | "">("");
  const [interestFrequency, setInterestFrequency] = useState<"daily" | "monthly" | "yearly">("monthly");
  const [compounding, setCompounding] = useState<"daily" | "monthly" | "yearly">("monthly");
  const [deadline, setDeadline] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) {
      setError("Please select a counterparty.");
      return;
    }
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

    const res = await createRequestAction({
      recipientId: recipient.id,
      direction,
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
    } else if (res.requestId) {
      router.push(`/requests/${res.requestId}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl bg-white dark:bg-[#1A1C23] rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 p-6 sm:p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Counterparty
          </label>
          {recipient ? (
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold uppercase">
                  {recipient.username.substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {recipient.full_name || "Monly User"}
                  </h4>
                  <p className="text-xs text-zinc-500">@{recipient.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRecipient(null)}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Change
              </button>
            </div>
          ) : (
            <div>
              <UserSearchCombobox />
              <p className="text-xs text-zinc-400 mt-1">Search for another Monly user to start an agreement.</p>
            </div>
          )}
        </div>

        {recipient && (
          <div className="space-y-6 animate-fadeIn">
            {/* Direction Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDirection("borrow")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                    direction === "borrow"
                      ? "border-zinc-950 bg-zinc-50 dark:border-white dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  Borrow money
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("lend")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                    direction === "lend"
                      ? "border-zinc-950 bg-zinc-50 dark:border-white dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Lend money
                </button>
              </div>
            </div>

            {/* Principal Amount */}
            <div className="space-y-1.5">
              <label htmlFor="amount" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Principal Amount (₹)
              </label>
              <div className="relative rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-100 overflow-hidden">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-semibold text-sm">₹</span>
                <input
                  id="amount"
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
              <label htmlFor="deadline" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Due Date / Repayment Deadline
              </label>
              <div className="relative rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-100 overflow-hidden">
                <input
                  id="deadline"
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
              <label htmlFor="note" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Personal Note (Optional)
              </label>
              <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                placeholder="Details about repayment, custom terms discussion, or general message..."
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-3 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 px-4 text-sm font-semibold text-white dark:text-zinc-950 transition-colors disabled:opacity-50 shadow-sm"
            >
              {pending ? "Submitting..." : "Send Request Proposal"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

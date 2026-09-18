"use client";

import { useActionState, useState } from "react";
import { Send, ArrowUpRight, ArrowDownLeft } from "lucide-react";

import { OfferTermsFields } from "@/components/negotiation/offer-terms-fields";
import { UsernameAutocomplete } from "@/components/negotiation/username-autocomplete";
import { createRequestAction, type ActionState } from "@/lib/requests/actions";

const initialState: ActionState = {};

export function NewRequestForm() {
  const [state, formAction, isPending] = useActionState(createRequestAction, initialState);
  const [direction, setDirection] = useState<"lend" | "borrow">("lend");

  return (
    <form action={formAction} className="flex flex-col gap-5 font-mono">
      {/* Direction Selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-black uppercase text-black dark:text-white">
          Agreement Direction
        </span>
        <div className="grid grid-cols-2 gap-3">
          {(["lend", "borrow"] as const).map((d) => {
            const isSelected = direction === d;
            const isLend = d === "lend";
            return (
              <label
                key={d}
                className={`flex h-12 cursor-pointer items-center justify-center gap-2 border-[2.5px] border-black font-mono text-xs sm:text-sm font-black uppercase transition-all shadow-[2px_2px_0_0_#000] select-none ${
                  isSelected
                    ? isLend
                      ? "bg-[#FB7185] text-white shadow-[3px_3px_0_0_#000] -translate-y-0.5"
                      : "bg-[#FFE600] text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5"
                    : "bg-white dark:bg-[var(--muted)] text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="direction"
                  value={d}
                  checked={direction === d}
                  onChange={() => setDirection(d)}
                  className="sr-only"
                />
                {isLend ? <ArrowUpRight className="w-4 h-4 stroke-[2.5]" /> : <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />}
                <span>{isLend ? "I'm Lending (Offer)" : "I'm Borrowing (Request)"}</span>
              </label>
            );
          })}
        </div>
      </div>

      <UsernameAutocomplete />
      <OfferTermsFields />

      {state.error && (
        <div className="p-3 border-[2px] border-[#F43F5E] bg-[#FF2E93]/15 text-[#9F1239] dark:text-[#FDA4AF] text-xs font-bold">
          ⚠️ {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full py-3 border-[2.5px] border-black bg-[#2DD4BF] text-black font-mono text-sm font-black uppercase shadow-[3px_3px_0_0_#000] hover:bg-teal-300 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        <Send className="w-4 h-4 stroke-[2.5]" />
        <span>{isPending ? "DISPATCHING PROPOSAL..." : "SEND PEER PROPOSAL"}</span>
      </button>
    </form>
  );
}

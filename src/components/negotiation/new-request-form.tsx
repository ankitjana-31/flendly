"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { OfferTermsFields } from "@/components/negotiation/offer-terms-fields";
import { UsernameAutocomplete } from "@/components/negotiation/username-autocomplete";
import { createRequestAction, type ActionState } from "@/lib/requests/actions";

const initialState: ActionState = {};

export function NewRequestForm() {
  const [state, formAction, isPending] = useActionState(createRequestAction, initialState);
  const [direction, setDirection] = useState<"lend" | "borrow">("lend");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2">
        {(["lend", "borrow"] as const).map((d) => (
          <label
            key={d}
            className={`flex h-11 cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
              direction === d ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:bg-muted"
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
            {d === "lend" ? "I'm lending" : "I'm borrowing"}
          </label>
        ))}
      </div>

      <UsernameAutocomplete />
      <OfferTermsFields />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "Sending…" : "Send request"}
      </Button>
    </form>
  );
}

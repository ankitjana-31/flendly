"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { updateProfileDetailsAction, type ProfileDetailsState } from "@/lib/privacy/actions";

const initialState: ProfileDetailsState = {};
const inputClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent";

export function ProfileDetailsForm({
  fullName,
  phoneNumber,
}: {
  fullName: string | null;
  phoneNumber: string | null;
}) {
  const [state, action, pending] = useActionState(updateProfileDetailsAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          maxLength={100}
          defaultValue={fullName ?? ""}
          placeholder="As shown to people you lend to or borrow from"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="phoneNumber">
          Phone number
        </label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          defaultValue={phoneNumber ?? ""}
          placeholder="Optional — controlled by phone visibility below"
          className={inputClass}
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Saved.</p>}

      <Button type="submit" size="sm" variant="secondary" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save details"}
      </Button>
    </form>
  );
}

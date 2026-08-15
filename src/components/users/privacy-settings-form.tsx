"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { updatePrivacySettingsAction, type PrivacyActionState } from "@/lib/privacy/actions";

const initialState: PrivacyActionState = {};

const selectClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent";

export function PrivacySettingsForm({
  avatarVisibility,
  emailVisibility,
  phoneVisibility,
}: {
  avatarVisibility: "everyone" | "participants" | "nobody";
  emailVisibility: "only_me" | "participants";
  phoneVisibility: "only_me" | "participants";
}) {
  const [state, action, pending] = useActionState(updatePrivacySettingsAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="avatarVisibility">
          Who can see your avatar
        </label>
        <select id="avatarVisibility" name="avatarVisibility" defaultValue={avatarVisibility} className={selectClass}>
          <option value="everyone">Everyone</option>
          <option value="participants">Only people you&apos;re transacting with</option>
          <option value="nobody">Nobody</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="emailVisibility">
          Who can see your email
        </label>
        <select id="emailVisibility" name="emailVisibility" defaultValue={emailVisibility} className={selectClass}>
          <option value="only_me">Only me</option>
          <option value="participants">Only people you&apos;re transacting with</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="phoneVisibility">
          Who can see your phone number
        </label>
        <select id="phoneVisibility" name="phoneVisibility" defaultValue={phoneVisibility} className={selectClass}>
          <option value="only_me">Only me</option>
          <option value="participants">Only people you&apos;re transacting with</option>
        </select>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Saved.</p>}

      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save privacy settings"}
      </Button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { updatePrivacySettingsAction, type PrivacyActionState } from "@/lib/privacy/actions";

const initialState: PrivacyActionState = {};

const selectClass =
  "h-10 w-full border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#161821] px-3 text-xs sm:text-sm font-bold text-black dark:text-white outline-none shadow-[2px_2px_0_0_#000] focus:bg-[#FEF08A] focus:text-black dark:focus:bg-[#2A2E3D]";

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
    <form action={action} className="flex flex-col gap-3 font-mono">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase" htmlFor="avatarVisibility">
          Who can see your avatar
        </label>
        <select id="avatarVisibility" name="avatarVisibility" defaultValue={avatarVisibility} className={selectClass}>
          <option value="everyone">Everyone</option>
          <option value="participants">Only counterparties in active deals</option>
          <option value="nobody">Nobody</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase" htmlFor="emailVisibility">
          Who can see your email
        </label>
        <select id="emailVisibility" name="emailVisibility" defaultValue={emailVisibility} className={selectClass}>
          <option value="only_me">Only me</option>
          <option value="participants">Only counterparties in active deals</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase" htmlFor="phoneVisibility">
          Who can see your phone number
        </label>
        <select id="phoneVisibility" name="phoneVisibility" defaultValue={phoneVisibility} className={selectClass}>
          <option value="only_me">Only me</option>
          <option value="participants">Only counterparties in active deals</option>
        </select>
      </div>

      {state.error && <p className="text-xs font-bold text-[#F43F5E]">⚠️ {state.error}</p>}
      {state.success && <p className="text-xs font-bold text-[#059669] dark:text-[#2DD4BF]">✓ Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start px-4 py-2 border-[2px] border-black bg-[#FFE600] text-black font-mono text-xs font-black uppercase shadow-[2px_2px_0_0_#000] hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 cursor-pointer transition-all"
      >
        {pending ? "SAVING..." : "SAVE PRIVACY SETTINGS"}
      </button>
    </form>
  );
}


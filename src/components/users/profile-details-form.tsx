"use client";

import { useActionState } from "react";
import { updateProfileDetailsAction, type ProfileDetailsState } from "@/lib/privacy/actions";

const initialState: ProfileDetailsState = {};
const inputClass =
  "h-10 w-full border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#161821] px-3 text-xs sm:text-sm font-bold text-black dark:text-white outline-none shadow-[2px_2px_0_0_#000] focus:bg-[#FEF08A] focus:text-black dark:focus:bg-[#2A2E3D]";

export function ProfileDetailsForm({
  fullName,
  phoneNumber,
}: {
  fullName: string | null;
  phoneNumber: string | null;
}) {
  const [state, action, pending] = useActionState(updateProfileDetailsAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-3 font-mono">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          maxLength={100}
          defaultValue={fullName ?? ""}
          placeholder="As shown to counterparties"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase" htmlFor="phoneNumber">
          Phone number
        </label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          defaultValue={phoneNumber ?? ""}
          placeholder="Optional — controlled by privacy below"
          className={inputClass}
        />
      </div>

      {state.error && <p className="text-xs font-bold text-[#F43F5E]">⚠️ {state.error}</p>}
      {state.success && <p className="text-xs font-bold text-[#059669] dark:text-[#2DD4BF]">✓ Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start px-4 py-2 border-[2px] border-black bg-[#2563EB] text-white font-mono text-xs font-black uppercase shadow-[2px_2px_0_0_#000] hover:bg-blue-600 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 cursor-pointer transition-all"
      >
        {pending ? "SAVING..." : "SAVE DETAILS"}
      </button>
    </form>
  );
}


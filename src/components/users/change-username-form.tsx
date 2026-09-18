"use client";

import { useActionState } from "react";
import { updateUsernameAction, type UsernameFormState } from "@/lib/users/actions";

const initialState: UsernameFormState = {};
export function ChangeUsernameForm({
  currentUsername,
  changesUsed,
}: {
  currentUsername: string;
  changesUsed: number;
}) {
  const [state, action, pending] = useActionState(updateUsernameAction, initialState);

  if (changesUsed >= 1) {
    return (
      <div className="flex flex-col gap-1 font-mono">
        <p className="text-sm font-bold text-black dark:text-white">@{currentUsername}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          You&apos;ve already used your one free username change.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3 font-mono">
      <div className="flex border-[2px] border-black dark:border-white/60 bg-white dark:bg-[var(--card)] shadow-[2px_2px_0_0_#000]">
        <span className="flex items-center border-r-[2px] border-black dark:border-white/60 px-3 text-black dark:text-white font-bold bg-[#FAF8F5] dark:bg-[var(--muted)]">
          @
        </span>
        <input
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={20}
          pattern="[a-z0-9_]{3,20}"
          defaultValue={currentUsername}
          className="h-10 min-w-0 flex-1 bg-transparent px-3 text-xs sm:text-sm font-bold text-black dark:text-white outline-none focus:bg-[#FEF08A] focus:text-black dark:focus:bg-[#2A2E3D]"
        />
      </div>
      {state.error && <p className="text-xs font-bold text-[#F43F5E]">⚠️ {state.error}</p>}
      {state.success && <p className="text-xs font-bold text-[#059669] dark:text-[#2DD4BF]">✓ Username updated.</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start px-4 py-2 border-[2px] border-black bg-[#FFE600] text-black font-mono text-xs font-black uppercase shadow-[2px_2px_0_0_#000] hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 cursor-pointer transition-all"
      >
        {pending ? "SAVING..." : "UPDATE USERNAME"}
      </button>
    </form>
  );
}


"use client";

import { useActionState, useState } from "react";
import { User, AtSign, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { completeUsername } from "@/lib/users/actions";

const initialState = {
  error: undefined,
};

export function UsernameForm() {
  const [state, action, pending] = useActionState(
    completeUsername,
    initialState,
  );
  const [usernameInput, setUsernameInput] = useState("");
  const [fullNameInput, setFullNameInput] = useState("");

  const cleanUsername = usernameInput.trim().toLowerCase();
  const isValidUsername = /^[a-z0-9_]{3,20}$/.test(cleanUsername);

  return (
    <form action={action} className="mt-6 space-y-5 font-mono">
      {/* Full Name Input */}
      <div className="space-y-1.5">
        <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white">
          Full Name
        </label>
        <div className="relative flex items-center border-[2px] border-black dark:border-white/50 bg-white dark:bg-[#1E212D] shadow-[2px_2px_0_0_#000]">
          <div className="flex h-11 w-10 items-center justify-center border-r-[2px] border-black dark:border-white/30 text-gray-500 dark:text-gray-400">
            <User className="h-4 w-4" />
          </div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            maxLength={100}
            value={fullNameInput}
            onChange={(e) => setFullNameInput(e.target.value)}
            className="h-11 w-full bg-transparent px-3 text-sm font-bold text-black dark:text-white outline-none placeholder:text-gray-400 font-mono"
            placeholder="e.g. Rahul Sharma"
          />
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-sans">
          How your display name will appear to your friends & counterparties.
        </p>
      </div>

      {/* Username Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            Username / Handle
          </label>
          <span className="text-[10px] font-bold text-gray-500">
            {cleanUsername.length}/20 chars
          </span>
        </div>
        <div className="relative flex items-center border-[2px] border-black dark:border-white/50 bg-white dark:bg-[#1E212D] shadow-[2px_2px_0_0_#000]">
          <div className="flex h-11 w-10 items-center justify-center border-r-[2px] border-black dark:border-white/30 text-gray-500 dark:text-gray-400">
            <AtSign className="h-4 w-4" />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-z0-9_]{3,20}"
            autoComplete="username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-black dark:text-white outline-none placeholder:text-gray-400 font-mono"
            placeholder="rahul"
          />
          {cleanUsername.length >= 3 && (
            <div className="pr-3">
              {isValidUsername ? (
                <CheckCircle2 className="h-4 w-4 text-[#059669] dark:text-[#2DD4BF]" />
              ) : (
                <AlertCircle className="h-4 w-4 text-[#F43F5E]" />
              )}
            </div>
          )}
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-sans">
          3–20 characters: lowercase letters, numbers, and underscores.
        </p>
      </div>

      {/* Error Callout */}
      {state.error ? (
        <div className="flex items-start gap-2 border-[2px] border-black bg-[#F43F5E]/15 p-3 text-xs text-[#F43F5E] font-bold shadow-[2px_2px_0_0_#000]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="font-mono leading-relaxed">[ERR]: {state.error}</p>
        </div>
      ) : null}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending || !isValidUsername}
        className="group relative flex h-12 w-full items-center justify-center gap-2 border-[2.5px] border-black bg-[#FFE600] px-4 font-mono text-sm font-black text-black shadow-[3px_3px_0_0_#000000] transition-all hover:bg-yellow-300 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000000] active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>CONFIGURING ACCOUNT...</span>
          </>
        ) : (
          <>
            <span>START USING FLENDLY</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}

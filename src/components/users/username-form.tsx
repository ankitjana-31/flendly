"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, AtSign, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { completeUsername } from "@/lib/users/actions";
import { cn } from "@/lib/utils";

const initialState = {
  error: undefined,
};

export function UsernameForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    completeUsername,
    initialState,
  );
  const [usernameInput, setUsernameInput] = useState("");
  const [fullNameInput, setFullNameInput] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        router.push("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  const cleanUsername = usernameInput.trim().toLowerCase();
  const isValidUsername = /^[a-z0-9_]{3,20}$/.test(cleanUsername);

  return (
    <form action={action} className="mt-4 sm:mt-5 space-y-3.5 sm:space-y-4 font-mono">
      {/* Full Name Input */}
      <div className="space-y-1">
        <label htmlFor="fullName" className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-black dark:text-white">
          Full Name
        </label>
        <div className="relative flex items-center border-[2px] border-black dark:border-white/50 bg-white dark:bg-[var(--muted)] shadow-[2px_2px_0_0_#000] rounded-[6px]">
          <div className="flex h-10 w-9 items-center justify-center border-r-[2px] border-black dark:border-white/30 text-gray-500 dark:text-gray-400">
            <User className="h-3.5 w-3.5" />
          </div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            maxLength={100}
            value={fullNameInput}
            onChange={(e) => setFullNameInput(e.target.value)}
            className="h-10 w-full bg-transparent px-3 text-xs sm:text-sm font-bold text-black dark:text-white outline-none placeholder:text-gray-400 font-mono"
            placeholder="Your display name"
          />
        </div>
        <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-sans">
          This is how your name will appear to other people on Flendly.
        </p>
      </div>

      {/* Username Input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="username" className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            Username / Handle
          </label>
          <span className="text-[10px] font-bold text-gray-500">
            {cleanUsername.length}/20 chars
          </span>
        </div>
        <div className="relative flex items-center border-[2px] border-black dark:border-white/50 bg-white dark:bg-[var(--muted)] shadow-[2px_2px_0_0_#000] rounded-[6px]">
          <div className="flex h-10 w-9 items-center justify-center border-r-[2px] border-black dark:border-white/30 text-gray-500 dark:text-gray-400">
            <AtSign className="h-3.5 w-3.5" />
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
            className="h-10 min-w-0 flex-1 bg-transparent px-3 text-xs sm:text-sm font-bold text-black dark:text-white outline-none placeholder:text-gray-400 font-mono"
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
        <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-sans">
          3 to 20 characters · lowercase, numbers, underscores
        </p>
      </div>

      {/* Error Callout */}
      {state.error ? (
        <div className="flex items-start gap-2 border-[2px] border-black bg-[#F43F5E]/15 p-2.5 text-xs text-[#F43F5E] font-bold shadow-[2px_2px_0_0_#000] rounded-[6px]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="font-mono leading-relaxed">[ERR]: {state.error}</p>
        </div>
      ) : null}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending || !isValidUsername}
        className={cn(
          "relative flex h-11 w-full items-center justify-center gap-2 border-[2.5px] font-mono text-xs sm:text-sm font-black transition-all rounded-[8px]",
          isValidUsername && !pending
            ? "border-black bg-[#FFE600] text-black shadow-[3px_3px_0_0_#000000] hover:bg-yellow-300 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000000] active:translate-y-0.5 active:shadow-none cursor-pointer"
            : "border-gray-400 dark:border-gray-700 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 shadow-none cursor-not-allowed opacity-75"
        )}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-current" />
            <span>CONFIGURING ACCOUNT...</span>
          </>
        ) : (
          <span>START USING FLENDLY</span>
        )}
      </button>
    </form>
  );
}

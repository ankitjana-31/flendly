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
    <form action={action} className="mt-8 space-y-6">
      {/* Full Name Input */}
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Full Name
        </label>
        <div className="relative flex items-center rounded-xl border border-border bg-background/50 backdrop-blur-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <div className="flex h-12 w-11 items-center justify-center text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            maxLength={100}
            value={fullNameInput}
            onChange={(e) => setFullNameInput(e.target.value)}
            className="h-12 w-full bg-transparent pr-4 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
            placeholder="e.g. Ankit Jana"
          />
        </div>
        <p className="text-[11px] text-muted-foreground/80">
          How your display name will appear to your friends & counterparties.
        </p>
      </div>

      {/* Username Input */}
      <div className="space-y-2">
        <label htmlFor="username" className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Username</span>
          <span className="text-[10px] font-normal text-muted-foreground/70">
            {cleanUsername.length}/20 chars
          </span>
        </label>
        <div className="relative flex items-center rounded-xl border border-border bg-background/50 backdrop-blur-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <div className="flex h-12 w-11 items-center justify-center border-r border-border/60 text-muted-foreground">
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
            className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
            placeholder="ankit"
          />
          {cleanUsername.length >= 3 && (
            <div className="pr-3">
              {isValidUsername ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/80">
          3–20 characters: lowercase letters, numbers, and underscores.
        </p>
      </div>

      {/* Error Callout */}
      {state.error ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="font-medium leading-relaxed">{state.error}</p>
        </div>
      ) : null}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending || !isValidUsername}
        className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Setting up your account...</span>
          </>
        ) : (
          <>
            <span>Start using Flendly</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}

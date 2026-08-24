"use client";

import { useActionState } from "react";

import { completeUsername } from "@/lib/users/actions";

const initialState = {
  error: undefined,
};

export function UsernameForm() {
  const [state, action, pending] = useActionState(
    completeUsername,
    initialState,
  );

  return (
    <form action={action} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          maxLength={100}
          className="h-12 w-full rounded-lg border border-border bg-background px-3 text-foreground outline-none transition-colors focus:border-accent placeholder:text-muted-foreground"
          placeholder="e.g. Ankit Jana"
        />
        <p className="text-xs text-muted-foreground">
          How your name will appear to people you transact with.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium">
          Username
        </label>
        <div className="flex rounded-lg border border-border bg-background focus-within:border-accent">
          <span className="flex items-center border-r border-border px-3 text-muted-foreground">
            @
          </span>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-z0-9_]{3,20}"
            autoComplete="username"
            className="h-12 min-w-0 flex-1 bg-transparent px-3 text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="ankit"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          3-20 characters: lowercase letters, numbers, underscores.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Start using Flendly"}
      </button>
    </form>
  );
}

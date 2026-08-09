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
        <label
          htmlFor="username"
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-100"
        >
          Username
        </label>
        <div className="flex rounded-md border border-zinc-300 bg-white focus-within:border-blue-600 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600 dark:border-zinc-700 dark:bg-zinc-950">
          <span className="flex items-center border-r border-zinc-200 px-3 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
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
            className="h-12 min-w-0 flex-1 bg-transparent px-3 text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
            placeholder="ankit"
          />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Use lowercase letters, numbers, and underscores.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {pending ? "Saving..." : "Start using Monly"}
      </button>
    </form>
  );
}

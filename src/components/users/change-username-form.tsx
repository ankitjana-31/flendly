"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col gap-1">
        <p className="text-sm">@{currentUsername}</p>
        <p className="text-xs text-muted-foreground">
          You&apos;ve already used your one free username change.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex rounded-lg border border-border bg-background focus-within:border-accent">
        <span className="flex items-center border-r border-border px-3 text-muted-foreground">@</span>
        <input
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={20}
          pattern="[a-z0-9_]{3,20}"
          defaultValue={currentUsername}
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
        />
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Username updated.</p>}
      <Button type="submit" variant="secondary" size="sm" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Update username"}
      </Button>
    </form>
  );
}

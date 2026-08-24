"use client";

import { useActionState } from "react";
import { updatePrivacy } from "@/lib/users/actions";
import { Eye, HelpCircle } from "lucide-react";

interface PrivacyFormProps {
  privacy: {
    avatar_visibility: "everyone" | "participants" | "nobody";
    email_visibility: "only_me" | "participants";
    phone_visibility: "only_me" | "participants";
  };
}

export function PrivacyForm({ privacy }: PrivacyFormProps) {
  const [state, action, pending] = useActionState(updatePrivacy, {
    error: undefined,
    success: undefined,
  });

  return (
    <section className="bg-white dark:bg-[#1A1C23] rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Privacy Visibility Settings
        </h2>
        <div className="group relative">
          <HelpCircle className="h-4 w-4 text-zinc-400 cursor-help" />
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-zinc-900 text-white text-xs rounded p-2 shadow-lg z-20">
            &quot;Participants&quot; refers to other Monly users who have an active or past loan request, offer, or agreement with you.
          </div>
        </div>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
        Control who can see your contact info and avatar profile photo.
      </p>

      <form action={action} className="mt-6 space-y-6">
        {/* Avatar Visibility */}
        <div className="space-y-2">
          <label htmlFor="avatarVisibility" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Avatar visibility
          </label>
          <select
            id="avatarVisibility"
            name="avatarVisibility"
            disabled={pending}
            defaultValue={privacy.avatar_visibility}
            className="block h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
          >
            <option value="everyone" className="bg-white dark:bg-zinc-950">Everyone</option>
            <option value="participants" className="bg-white dark:bg-zinc-950">Participants Only</option>
            <option value="nobody" className="bg-white dark:bg-zinc-950">Nobody</option>
          </select>
        </div>

        {/* Email Visibility */}
        <div className="space-y-2">
          <label htmlFor="emailVisibility" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Email address visibility
          </label>
          <select
            id="emailVisibility"
            name="emailVisibility"
            disabled={pending}
            defaultValue={privacy.email_visibility}
            className="block h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
          >
            <option value="only_me" className="bg-white dark:bg-zinc-950">Only Me (Private)</option>
            <option value="participants" className="bg-white dark:bg-zinc-950">Participants Only</option>
          </select>
        </div>

        {/* Phone Visibility */}
        <div className="space-y-2">
          <label htmlFor="phoneVisibility" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Phone number visibility
          </label>
          <select
            id="phoneVisibility"
            name="phoneVisibility"
            disabled={pending}
            defaultValue={privacy.phone_visibility}
            className="block h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
          >
            <option value="only_me" className="bg-white dark:bg-zinc-950">Only Me (Private)</option>
            <option value="participants" className="bg-white dark:bg-zinc-950">Participants Only</option>
          </select>
        </div>

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Privacy settings updated successfully!
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 px-4 text-xs font-semibold text-white dark:text-zinc-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Saving..." : "Save Privacy Settings"}
        </button>
      </form>
    </section>
  );
}

"use client";

import { useActionState, useState } from "react";
import { updateProfile, changeUsername } from "@/lib/users/actions";
import { User, Smartphone, AtSign } from "lucide-react";

interface ProfileFormProps {
  profile: {
    id: string;
    username: string;
    username_changed_count: number;
    full_name: string | null;
    email: string;
    phone_number: string | null;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const isPlaceholder = Boolean(profile.username.match(/^user_[0-9a-f]{8}$/));
  const canChangeUsername = isPlaceholder || profile.username_changed_count < 1;

  const [usernameState, usernameAction, usernamePending] = useActionState(
    changeUsername,
    { error: undefined, success: undefined }
  );

  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    { error: undefined, success: undefined }
  );

  return (
    <div className="space-y-8">
      {/* Username Management */}
      <section className="bg-white dark:bg-[#1A1C23] rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Username
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Your public identifier on Monly.
          {!canChangeUsername && " You have already changed your username once and cannot change it again."}
          {canChangeUsername && isPlaceholder && " Choose a unique username to replace your placeholder ID."}
          {canChangeUsername && !isPlaceholder && " You can change your username one time."}
        </p>

        <form action={usernameAction} className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-100 overflow-hidden">
              <span className="flex items-center bg-zinc-50 dark:bg-zinc-900 px-3 border-r border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <AtSign className="h-4 w-4" />
              </span>
              <input
                id="username"
                name="username"
                type="text"
                required
                disabled={!canChangeUsername || usernamePending}
                defaultValue={profile.username}
                minLength={3}
                maxLength={20}
                pattern="[a-z0-9_]{3,20}"
                className="h-10 flex-1 bg-transparent px-3 text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="username"
              />
            </div>
            {canChangeUsername && (
              <p className="text-xs text-zinc-400">
                Use 3-20 characters: lowercase letters, numbers, and underscores.
              </p>
            )}
          </div>

          {usernameState.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {usernameState.error}
            </p>
          )}

          {usernameState.success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Username updated successfully!
            </p>
          )}

          {canChangeUsername && (
            <button
              type="submit"
              disabled={usernamePending}
              className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 px-4 text-xs font-semibold text-white dark:text-zinc-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {usernamePending ? "Saving..." : "Update Username"}
            </button>
          )}
        </form>
      </section>

      {/* Profile Details */}
      <section className="bg-white dark:bg-[#1A1C23] rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Personal Information
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Update your public profile details.
        </p>

        <form action={profileAction} className="mt-4 space-y-4">
          {/* Email (Read only) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Email Address (Google Account)
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={profile.email}
              className="h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 text-sm text-zinc-500 dark:text-zinc-400 outline-none cursor-not-allowed"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Display Name
            </label>
            <div className="flex rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-100 overflow-hidden">
              <span className="flex items-center bg-zinc-50 dark:bg-zinc-900 px-3 border-r border-zinc-200 dark:border-zinc-800 text-zinc-500">
                <User className="h-4 w-4" />
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                disabled={profilePending}
                defaultValue={profile.full_name || ""}
                placeholder="Rajarshi Mukherjee"
                className="h-10 flex-1 bg-transparent px-3 text-sm text-zinc-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label htmlFor="phoneNumber" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Phone Number
            </label>
            <div className="flex rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-100 overflow-hidden">
              <span className="flex items-center bg-zinc-50 dark:bg-zinc-900 px-3 border-r border-zinc-200 dark:border-zinc-800 text-zinc-500">
                <Smartphone className="h-4 w-4" />
              </span>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                disabled={profilePending}
                defaultValue={profile.phone_number || ""}
                placeholder="+91 98765 43210"
                className="h-10 flex-1 bg-transparent px-3 text-sm text-zinc-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {profileState.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {profileState.error}
            </p>
          )}

          {profileState.success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Profile updated successfully!
            </p>
          )}

          <button
            type="submit"
            disabled={profilePending}
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 px-4 text-xs font-semibold text-white dark:text-zinc-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {profilePending ? "Saving..." : "Save Details"}
          </button>
        </form>
      </section>
    </div>
  );
}

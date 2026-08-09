import { redirect } from "next/navigation";

import { signOut } from "@/lib/auth/actions";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";

export default async function DashboardPage() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-black/10 pb-6 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Monly
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}.
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-300">
              Your Supabase session is active. The lending workspace will grow
              from here as the next phases land.
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="h-10 rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 dark:border-zinc-700 dark:bg-[#1A1C23]">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Phase 1 foundation
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Authentication, profiles, privacy, and search now have database
            foundations. Domain workflows such as requests, offers, loans,
            payments, and notifications are intentionally not exposed here yet.
          </p>
        </section>
      </div>
    </main>
  );
}

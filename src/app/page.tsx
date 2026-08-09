import { redirect } from "next/navigation";

import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";

export default async function Home() {
  const { user, profile } = await getCurrentUserProfile();

  if (user && isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Monly
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-zinc-950 dark:text-zinc-50 sm:text-5xl">
          Friendly lending, clear records.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          Track personal loans, requests, repayment terms, and transparent
          histories with people you already trust.
        </p>
        <div className="mt-8">
          <a
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-md bg-zinc-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Continue with Google
          </a>
        </div>
      </section>
    </main>
  );
}

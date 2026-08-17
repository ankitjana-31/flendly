import Link from "next/link";
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />
      <section className="relative w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-primary font-heading text-lg font-bold text-primary-foreground">
          M
        </div>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Monly
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">
          Friendly lending, clear records.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
          Negotiate terms, track interest correctly, and keep one shared ledger
          with people you already trust — instead of a mental note or a
          screenshot.
        </p>
        <div className="mt-8">
          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Continue with Google
          </Link>
        </div>
      </section>
    </main>
  );
}

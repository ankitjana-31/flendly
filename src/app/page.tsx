import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />
      <section className="relative w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-heading text-xl font-bold text-primary-foreground shadow-sm">
          F
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Flendly
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">
          Friendly lending, clear records.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
          Negotiate terms, track interest accurately, and maintain one shared ledger
          with people you already trust — instead of mental notes or screenshots.
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

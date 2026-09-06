import { redirect } from "next/navigation";
import Link from "next/link";

import { signInWithGoogle } from "@/lib/auth/actions";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { GoogleSignInButton } from "@/components/users/google-sign-in-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LoginSparklesBackground } from "@/components/auth/login-sparkles-background";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { user, profile } = await getCurrentUserProfile();
  const { error } = await searchParams;

  if (user && isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
      {/* Dynamic Sparkles & Particle Background */}
      <LoginSparklesBackground />

      {/* Top Navigation / Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden>←</span> Back to home
        </Link>
      </div>

      {/* Central Login Card with Ambient Gradients */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glowing Top Beams (from Sparkles demo) */}
        <div className="relative mx-auto h-2 w-full max-w-xs">
          <div className="absolute inset-x-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
          <div className="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="absolute inset-x-12 top-0 h-[3px] w-1/2 bg-gradient-to-r from-transparent via-sky-400 to-transparent blur-xs" />
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-8 shadow-xl backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-heading text-base font-bold text-primary-foreground shadow-sm">
              F
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">Flendly</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">
              Track lending with people you trust.
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              Send a request, agree on terms, and keep one shared ledger instead of a
              screenshot of a bank transfer.
            </p>
          </div>

          {error ? (
            <p className="mt-6 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <form action={signInWithGoogle} className="mt-8">
            <GoogleSignInButton />
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
            Your email and phone number are private by default — you choose who,
            if anyone, can see them.
          </p>
        </section>
      </div>
    </main>
  );
}

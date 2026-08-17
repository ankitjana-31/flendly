import { redirect } from "next/navigation";

import { signInWithGoogle } from "@/lib/auth/actions";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { GoogleSignInButton } from "@/components/users/google-sign-in-button";

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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />

      <section className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-heading text-base font-bold text-primary-foreground">
            M
          </div>
          <span className="font-heading text-lg font-bold tracking-tight">Monly</span>
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
    </main>
  );
}

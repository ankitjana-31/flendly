import { redirect } from "next/navigation";

import { signInWithGoogle } from "@/lib/auth/actions";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";

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
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-md rounded-lg border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#1A1C23]">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Monly
          </p>
          <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
            Track lending with people you trust.
          </h1>
          <p className="text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Continue with Google to enter your private Monly workspace.
          </p>
        </div>

        {error ? (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <form action={signInWithGoogle} className="mt-8">
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Continue with Google
          </button>
        </form>
      </section>
    </main>
  );
}

import { redirect } from "next/navigation";

import { UsernameForm } from "@/components/users/username-form";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";

export default async function CompleteProfilePage() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (profile && !isPlaceholderUsername(profile.username)) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-lg rounded-lg border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#1A1C23]">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Finish setup
          </p>
          <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
            Choose your Monly username.
          </h1>
          <p className="text-base leading-7 text-zinc-600 dark:text-zinc-300">
            This is your public identifier. You can change it once after this
            first pick.
          </p>
        </div>

        <UsernameForm />
      </section>
    </main>
  );
}

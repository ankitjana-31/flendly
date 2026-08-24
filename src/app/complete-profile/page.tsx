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
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-heading text-base font-bold text-primary-foreground">
            F
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">Flendly</span>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Finish setup
          </p>
          <h1 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">
            Choose your Flendly username.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            This is your public identifier — it&apos;s how people find you to send
            or request money. You can change it once after this first pick.
          </p>
        </div>

        <UsernameForm />
      </section>
    </main>
  );
}

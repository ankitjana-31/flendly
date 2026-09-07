import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/button";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { BorderBeam } from "@/components/ui/border-beam";
import { GridPattern } from "@/components/ui/grid-pattern";

export default async function ProfilePage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Magic UI Grid Pattern Background */}
      <GridPattern
        width={32}
        height={32}
        x={-1}
        y={-1}
        strokeDasharray="4 2"
        className="[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] opacity-40 dark:opacity-20"
      />

      {/* Background Decorative Ambient Glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-blue-500/30 bg-card/90 p-8 shadow-2xl shadow-blue-500/25 backdrop-blur-xl sm:p-10">
        {/* Magic UI Border Beam Animation */}
        <BorderBeam
          duration={6}
          colorFrom="#3b82f6"
          colorTo="#93c5fd"
          borderWidth={2}
          glow={true}
        />
        {/* Brand Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-heading text-lg font-bold text-primary-foreground shadow-sm">
              F
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              Monly
            </span>
          </div>

          <span className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent">
            <Sparkles className="h-3 w-3" /> Step 1 of 1
          </span>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Your Profile
          </p>
          <h1 className="font-heading text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {profile?.full_name ?? `@${profile?.username}`}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This is your public profile on Monly.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2">
          <Link
            href="/profile/settings"
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Settings
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex-1 rounded-md bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
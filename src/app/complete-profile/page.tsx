import { redirect } from "next/navigation";
import { Sparkles, ShieldCheck } from "lucide-react";

import { UsernameForm } from "@/components/users/username-form";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { BorderBeam } from "@/components/ui/border-beam";

export default async function CompleteProfilePage() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (profile && !isPlaceholderUsername(profile.username)) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background Decorative Ambient Glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-8 shadow-xl backdrop-blur-md sm:p-10">
        {/* Magic UI Border Beam Animation */}
        <BorderBeam
          size={180}
          duration={8}
          colorFrom="#3b82f6"
          colorTo="#8b5cf6"
          borderWidth={1.5}
        />
        {/* Brand Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-heading text-lg font-bold text-primary-foreground shadow-sm">
              F
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              Flendly
            </span>
          </div>

          <span className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent">
            <Sparkles className="h-3 w-3" /> Step 1 of 1
          </span>
        </div>

        {/* Title Section */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Account Setup
          </p>
          <h1 className="font-heading text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            Welcome! Pick your username.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This is your unique handle for sending, receiving, and tracking peer-to-peer agreements with friends.
          </p>
        </div>

        {/* Form Component */}
        <UsernameForm />

        {/* Trust Footer */}
        <div className="mt-8 flex items-center justify-center gap-1.5 border-t border-border/60 pt-6 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Private by default · End-to-end ledger verification</span>
        </div>
      </section>
    </main>
  );
}

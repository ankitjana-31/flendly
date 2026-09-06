import { redirect } from "next/navigation";

import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LandingHero } from "@/components/landing/landing-hero";

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
      <LandingHero />
    </main>
  );
}

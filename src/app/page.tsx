import { redirect } from "next/navigation";

import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LandingHero } from "@/components/landing/landing-hero";
import { InteractiveGridBackground } from "@/components/landing/interactive-grid-background";

export default async function Home() {
  const { user, profile } = await getCurrentUserProfile();

  if (user && isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 bg-slate-950">
      <InteractiveGridBackground />

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <LandingHero />
    </main>
  );
}

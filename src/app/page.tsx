import { redirect } from "next/navigation";

import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LandingHero } from "@/components/landing/landing-hero";
import { BeamsBackground } from "@/components/ui/beams-background";

export default async function Home() {
  const { user, profile } = await getCurrentUserProfile();

  if (user && isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  if (user) {
    redirect("/dashboard");
  }

  return (
    <BeamsBackground intensity="strong" className="px-6 py-12">
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <LandingHero />
    </BeamsBackground>
  );
}

import { redirect } from "next/navigation";

import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingPreviewSection } from "@/components/landing/landing-preview-section";
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
    <BeamsBackground intensity="strong" className="px-6 py-12 flex-col justify-start">
      <div className="absolute top-6 right-6 z-30">
        <ThemeToggle />
      </div>

      <div className="w-full flex flex-col items-center pt-8 sm:pt-16">
        <LandingHero />
        <LandingPreviewSection />
      </div>
    </BeamsBackground>
  );
}

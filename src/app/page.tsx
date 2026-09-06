import { redirect } from "next/navigation";

import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LandingHero } from "@/components/landing/landing-hero";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

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
      {/* Magic UI Animated Grid Pattern with Touch Glow */}
      <AnimatedGridPattern
        width={48}
        height={48}
        maxOpacity={0.6}
        numSquares={35}
        duration={3.5}
        className="[mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_95%)]"
      />

      {/* Ambient background depth lights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <LandingHero />
    </main>
  );
}

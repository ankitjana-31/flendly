import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
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
    <BeamsBackground intensity="strong" className="px-4 sm:px-6 py-6 flex-col justify-start bg-[#0B0F14]">
      {/* Retro OS Desktop Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto mb-8 flex items-center justify-between px-5 py-3 rounded-2xl border border-[#1E2935] bg-[#0E141D]/90 backdrop-blur-md retro-raised shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
          </div>
          <Link href="/" className="font-mono text-sm font-bold tracking-wider text-white flex items-center gap-2">
            <span className="text-teal-400">FLENDLY</span>
            <span className="text-slate-500 text-xs hidden sm:inline">// v1.0</span>
          </Link>
        </div>

        <nav className="flex items-center gap-3 sm:gap-6 font-mono text-xs text-slate-300">
          <Link href="/learn-more" className="hover:text-teal-300 transition-colors hidden sm:inline">
            How It Works
          </Link>
          <Link
            href="/auth/login"
            className="hover:text-teal-300 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-400 text-slate-950 font-bold retro-raised hover:bg-teal-300 transition-all shadow-sm"
          >
            <span>GET STARTED</span>
            <span>►</span>
          </Link>
        </nav>
      </header>

      <div className="w-full flex flex-col items-center">
        <LandingHero />
        <LandingPreviewSection />
      </div>
    </BeamsBackground>
  );
}

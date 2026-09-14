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
      {/* Stitch Flendly OS v2.4 Top Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto mb-8 flex items-center justify-between px-4 sm:px-6 py-3 rounded-sm border-[2.5px] border-black dark:border-white/80 bg-[#F5F2EB] dark:bg-[#161821] shadow-[4px_4px_0_0_#000000] dark:shadow-[4px_4px_0_0_#2563EB] transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center border-[2px] border-black bg-[#FFE600] font-mono text-xs font-black text-black shadow-sm">
            F
          </div>
          <div className="flex flex-col">
            <Link href="/" className="font-mono text-sm font-bold tracking-wider text-black dark:text-white uppercase flex items-center gap-1.5">
              <span>Flendly OS v2.4</span>
            </Link>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2 font-mono text-xs">
          <Link
            href="/"
            className="px-3 py-1.5 bg-[#2563EB] text-white border-[2px] border-black dark:border-white shadow-[2px_2px_0_0_#000000] font-bold"
          >
            FLENDLY_HOME.exe
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#1E212D] text-gray-800 dark:text-gray-200 hover:bg-[#FEF08A] hover:text-black transition-all"
          >
            DASHBOARD.exe
          </Link>
          <Link
            href="/self-track"
            className="px-3 py-1.5 border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#1E212D] text-gray-800 dark:text-gray-200 hover:bg-[#FEF08A] hover:text-black transition-all"
          >
            LEDGER.sys
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="px-3 py-1.5 border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#1E212D] text-black dark:text-white font-mono text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            LOGIN.exe
          </Link>
          <Link
            href="/auth/login"
            className="px-3.5 py-1.5 bg-[#FFE600] text-black border-[2px] border-black font-mono text-xs font-bold shadow-[2px_2px_0_0_#000000] hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1"
          >
            <span>⚡</span>
            <span>GET STARTED</span>
          </Link>
        </div>
      </header>

      <div className="w-full flex flex-col items-center">
        <LandingHero />
        <LandingPreviewSection />
      </div>
    </BeamsBackground>
  );
}

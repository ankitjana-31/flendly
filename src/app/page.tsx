import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingAuditSection } from "@/components/landing/landing-audit-section";
import { LandingPreviewSection } from "@/components/landing/landing-preview-section";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function Home() {
  const { user, profile } = await getCurrentUserProfile();

  if (user && isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen w-full bg-[#FAF8F5] dark:bg-[#0F1117] text-black dark:text-[#F1F5F9] font-sans selection:bg-[#FFE600] selection:text-black transition-colors duration-200">
      {/* Ambient Retro Geometric Grid Layer */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.16] [background-image:radial-gradient(#000000_1.5px,transparent_1.5px),linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] dark:[background-image:radial-gradient(#ffffff_1px,transparent_1px),linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px,64px_64px,64px_64px]" 
      />

      {/* Stitch Flendly OS v2.4 Fixed Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5F2EB] dark:bg-[#161821] border-b-[2.5px] border-black dark:border-white/80 shadow-[0_3px_0_0_#000000] dark:shadow-[0_3px_0_0_rgba(255,255,255,0.3)] transition-colors">
        <div className="h-14 max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border-[2px] border-black bg-[#FFE600] font-mono text-sm font-black text-black shadow-[2px_2px_0_0_#000]">
              ⚡
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                Flendly OS v2.4
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1.5 font-mono text-xs">
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

          <div className="flex items-center gap-2.5">
            {/* Retro Dual Theme Toggle */}
            <ThemeToggle />

            <Link
              href="/auth/login"
              className="hidden sm:inline-flex px-3 py-1 border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#1E212D] text-black dark:text-white font-mono text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-[2px_2px_0_0_#000000]"
            >
              LOGIN.exe
            </Link>
            <Link
              href="/auth/login"
              className="px-3.5 py-1.5 bg-[#FFE600] text-black border-[2px] border-black font-mono text-xs font-black shadow-[3px_3px_0_0_#000000] hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1"
            >
              <span>⚡</span>
              <span>GET STARTED</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area with Generous Breathing Room */}
      <main className="relative z-20 max-w-6xl mx-auto pt-24 px-4 md:px-6 pb-24 flex flex-col gap-16 md:gap-24 items-center">
        <LandingHero />
        <LandingAuditSection />
        <LandingPreviewSection />
      </main>
    </div>
  );
}

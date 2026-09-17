import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingAuditSection } from "@/components/landing/landing-audit-section";
import { LandingPreviewSection } from "@/components/landing/landing-preview-section";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";

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
        <div className="h-14 w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border-[2px] border-black bg-[#FFE600] font-mono text-sm font-black text-black shadow-[2px_2px_0_0_#000]">
              ⚡
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                FLENDLY
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 font-mono text-xs">
            <Link
              href="/"
              className="px-3 py-1.5 bg-[#2563EB] text-white border-[2px] border-black dark:border-white shadow-[2px_2px_0_0_#000000] font-bold hover:bg-[#FB7185] hover:text-white hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000000] active:translate-y-0.5 active:shadow-none transition-all"
            >
              HOME
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#1E212D] text-gray-800 dark:text-gray-200 hover:bg-[#FB7185] hover:text-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000000] active:translate-y-0.5 active:shadow-none transition-all"
            >
              DASHBOARD
            </Link>
            <Link
              href="/self-track"
              className="px-3 py-1.5 border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#1E212D] text-gray-800 dark:text-gray-200 hover:bg-[#FB7185] hover:text-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000000] active:translate-y-0.5 active:shadow-none transition-all"
            >
              LEDGER
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <Link
              href="/auth/login"
              className="hidden sm:inline-flex px-3 py-1.5 border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#1E212D] text-black dark:text-white font-mono text-xs font-bold hover:bg-[#FB7185] hover:text-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000000] active:translate-y-0.5 active:shadow-none transition-all shadow-[2px_2px_0_0_#000000]"
            >
              LOGIN
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-1.5 bg-[#FFE600] text-black border-[2px] border-black font-mono text-xs font-black shadow-[3px_3px_0_0_#000000] hover:bg-yellow-300 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000000] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5"
            >
              <span>⚡</span>
              <span>GET STARTED</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area filling wide desktop screen nicely */}
      <main className="relative z-20 w-full max-w-[1400px] mx-auto pt-16 md:pt-18 px-4 sm:px-6 lg:px-8 pb-12 flex flex-col gap-8 md:gap-10 items-center">
        <LandingHero />
        <LandingAuditSection />
        <LandingPreviewSection />
      </main>

      {/* Landing Footer */}
      <footer className="relative z-20 w-full border-t-[2.5px] border-black dark:border-white/40 bg-[#F5F2EB] dark:bg-[#161821] py-8">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center border-[2px] border-black bg-[#FFE600] font-mono text-xs font-black text-black shadow-[2px_2px_0_0_#000]">
              ⚡
            </div>
            <span className="font-bold tracking-wider text-black dark:text-white uppercase">FLENDLY</span>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <LegalFooterLinks />
            <p className="text-gray-600 dark:text-gray-400 text-center sm:text-right font-semibold">
              FLENDLY, all rights reserved under NEXCHARIS, 2026.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

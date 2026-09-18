import Image from "next/image";
import Link from "next/link";
import { LearnMoreHero } from "@/components/learn-more/hero-section";
import { LoanAnatomySection } from "@/components/learn-more/loan-anatomy-section";
import { SelfTrackShowcase } from "@/components/learn-more/self-track-showcase";
import { FinalCTAFooter } from "@/components/learn-more/final-cta-footer";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";

export default function LearnMorePage() {
  return (
    <div className="learn-more-page relative min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--accent)] selection:text-[var(--primary-foreground)] transition-colors duration-200">
      {/* Ambient Retro Geometric Grid Layer */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 opacity-[0.08] dark:opacity-[0.16] [background-image:radial-gradient(#000000_1.5px,transparent_1.5px),linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] dark:[background-image:radial-gradient(#ffffff_1px,transparent_1px),linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px,64px_64px,64px_64px]" 
      />

      {/* Stitch Flendly OS v2.4 Fixed Top Navigation Bar */}
      <header className="public-header fixed top-0 left-0 right-0 z-50 bg-[var(--muted)] border-b-[2.5px] border-[var(--border)] shadow-[0_3px_0_0_#000000] transition-colors">
        <div className="h-14 max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/flendly-symbol.svg"
              alt="Flendly"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                FLENDLY
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1.5 font-mono text-xs">
            <Link
              href="/"
              className="px-3 py-1.5 border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#1E212D] text-gray-800 dark:text-gray-200 hover:bg-[#FEF08A] hover:text-black transition-all"
            >
              HOME
            </Link>
            <Link
              href="/learn-more"
              className="px-3 py-1.5 bg-[#2563EB] text-white border-[2px] border-black dark:border-white shadow-[2px_2px_0_0_#000000] font-bold"
            >
              HOW IT WORKS
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#1E212D] text-gray-800 dark:text-gray-200 hover:bg-[#FEF08A] hover:text-black transition-all"
            >
              DASHBOARD
            </Link>
            <Link
              href="/self-track"
              className="px-3 py-1.5 border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#1E212D] text-gray-800 dark:text-gray-200 hover:bg-[#FEF08A] hover:text-black transition-all"
            >
              SELF TRACK
            </Link>
            <Link
              href="/learn-more/lending"
              className="px-3 py-1.5 border-[2px] border-black dark:border-white/60 bg-white dark:bg-[#1E212D] text-gray-800 dark:text-gray-200 hover:bg-[#FEF08A] hover:text-black transition-all"
            >
              LEND MONEY
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <Link
              href="/auth/login"
              className="px-3.5 py-1.5 bg-[#FFE600] text-black border-[2px] border-black font-mono text-xs font-black shadow-[3px_3px_0_0_#000000] hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1"
            >
              <span>LAUNCH APP</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-20 max-w-6xl mx-auto pt-16 md:pt-18 px-4 md:px-6 pb-12 flex flex-col gap-8 md:gap-10 items-center">
        <LearnMoreHero />
        <LoanAnatomySection />
        <SelfTrackShowcase />
        <FinalCTAFooter />
      </main>

      {/* Footer */}
      <footer className="public-footer relative z-20 w-full border-t-[2.5px] border-[var(--border)] bg-[var(--muted)] py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <Image
              src="/brand/flendly-symbol.svg"
              alt="Flendly"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0"
            />
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

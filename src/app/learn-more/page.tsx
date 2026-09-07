import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LearnMoreHero } from "@/components/learn-more/hero-section";
import { LoanAnatomySection } from "@/components/learn-more/loan-anatomy-section";
import { SolvesItSection } from "@/components/learn-more/solves-it-section";
import { SelfTrackShowcase } from "@/components/learn-more/self-track-showcase";
import { FinalCTAFooter } from "@/components/learn-more/final-cta-footer";

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F8FAFC] overflow-x-hidden selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 backdrop-blur-xl border-b border-[#1E2935]/80 bg-[#0B0F14]/80">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-400 to-blue-500 font-heading text-base font-bold text-black shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            F
          </div>
          <span className="font-brand text-2xl font-bold tracking-wider text-white group-hover:text-teal-300 transition-colors">
            FLENDLY
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/auth/login"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#60A5FA] text-[#0B0F14] text-sm font-bold shadow-lg shadow-teal-500/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <LearnMoreHero />

      {/* The Anatomy of a Forgotten Loan */}
      <LoanAnatomySection />

      {/* How Flendly Solves It */}
      <SolvesItSection />

      {/* Self Track Showcase */}
      <SelfTrackShowcase />

      {/* Final CTA */}
      <FinalCTAFooter />
    </div>
  );
}

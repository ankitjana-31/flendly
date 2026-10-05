import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UsernameForm } from "@/components/users/username-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RetroWindow } from "@/components/ui/retro-window";
import { CursorGlow } from "@/components/ui/cursor-glow";
import { AuthWaveBackground } from "@/components/auth/login-wave-background";

export default function CompleteProfilePreviewPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-[var(--background)] text-[var(--foreground)] px-4 py-4 sm:py-6 transition-colors duration-200">
      {/* Ambient Retro Geometric Grid Layer */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.16] [background-image:radial-gradient(#000000_1.5px,transparent_1.5px),linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] dark:[background-image:radial-gradient(#ffffff_1px,transparent_1px),linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px,64px_64px,64px_64px]" 
      />

      {/* Stitch Design System Subtle Background Wave Motif */}
      <AuthWaveBackground />

      <CursorGlow />

      {/* Top Safe Navigation Bar above the window */}
      <div className="relative z-30 w-full max-w-md flex items-center justify-between mb-2.5 sm:mb-3 px-0.5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[var(--foreground)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-black bg-[var(--card)] px-3 py-1.5 rounded-[4px] border-[2px] border-[var(--border)] shadow-[3px_3px_0_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <span aria-hidden className="text-[#2563EB] dark:text-[#60A5FA]">◄</span> [ESC] BACK TO HOME
        </Link>
        <ThemeToggle />
      </div>

      <div className="relative z-20 w-full max-w-md">
        <RetroWindow
          title="FLENDLY // ACCOUNT SETUP"
          colorBar="blue"
          glow={true}
          className="bg-[var(--card)] border-[2.5px] border-[var(--border)] shadow-[6px_6px_0_0_#000000]"
          headerClassName="bg-[#2563EB] text-white"
          contentClassName="p-4 sm:p-6"
        >
          {/* Brand Header */}
          <div className="mb-3 sm:mb-4 flex items-center gap-2.5 border-b-[2px] border-black/10 dark:border-white/10 pb-3 font-mono">
            <Image src="/brand/flendly-symbol.svg" alt="Flendly" width={36} height={36} className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" />
            <div>
              <span className="font-mono text-base sm:text-lg font-bold tracking-tight text-black dark:text-white block">
                FLENDLY
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-bold tracking-wider uppercase block">
                ACCOUNT SETUP
              </span>
            </div>
          </div>

          {/* Title Section */}
          <div className="space-y-0.5 sm:space-y-1">
            <h1 className="font-heading text-lg sm:text-xl font-black leading-tight text-black dark:text-white">
              Pick your personal handle.
            </h1>
            <p className="text-[11px] sm:text-xs leading-relaxed text-gray-600 dark:text-gray-300 font-sans">
              This is how people will find you and identify you on Flendly.
            </p>
          </div>

          {/* Form Component */}
          <UsernameForm />

          {/* Trust Footer */}
          <div className="mt-4 sm:mt-5 flex items-center justify-center gap-1.5 border-t-[2px] border-black/10 dark:border-white/10 pt-3 font-mono text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5 text-[#059669] dark:text-[#2DD4BF]" />
            <span>Your profile information stays private.</span>
          </div>
        </RetroWindow>
      </div>
    </main>
  );
}
import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UsernameForm } from "@/components/users/username-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RetroWindow } from "@/components/ui/retro-window";
import { CursorGlow } from "@/components/ui/cursor-glow";

export default function CompleteProfilePreviewPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[var(--background)] text-[var(--foreground)] px-4 py-8 transition-colors duration-200">
      {/* Ambient Retro Geometric Grid Layer */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.16] [background-image:radial-gradient(#000000_1.5px,transparent_1.5px),linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] dark:[background-image:radial-gradient(#ffffff_1px,transparent_1px),linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px,64px_64px,64px_64px]" 
      />

      <CursorGlow />

      {/* Top Controls */}
      <div className="absolute top-5 right-5 z-30">
        <ThemeToggle />
      </div>

      <div className="absolute top-5 left-5 z-30">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[var(--foreground)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-[var(--primary-foreground)] bg-[var(--card)] px-3.5 py-1.5 border-[2px] border-[var(--border)] shadow-[3px_3px_0_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <span aria-hidden className="text-[#2563EB] dark:text-[#60A5FA]">◄</span> [ESC] BACK TO HOME
        </Link>
      </div>

      <div className="relative z-20 w-full max-w-md">
        <RetroWindow
          title="FLENDLY // SETUP"
          subtitle="PROFILE INITIALIZATION"
          colorBar="blue"
          glow={true}
          className="bg-[var(--card)] border-[2.5px] border-[var(--border)] shadow-[6px_6px_0_0_#000000]"
          headerClassName="bg-[#2563EB] text-white"
          contentClassName="p-6 sm:p-8"
          headerRight={
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-white bg-black/20 px-2 py-0.5 border border-white/30 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFE600] animate-pulse" />
              <span>STEP 1 OF 1</span>
            </div>
          }
        >
          {/* Brand Header */}
          <div className="mb-6 flex items-center justify-between border-b-[2px] border-black/10 dark:border-white/10 pb-4 font-mono">
            <div className="flex items-center gap-3">
              <Image src="/brand/flendly-symbol.svg" alt="Flendly" width={40} height={40} className="h-10 w-10 shrink-0" />
              <div>
                <span className="font-mono text-lg font-bold tracking-tight text-black dark:text-white block">
                  FLENDLY
                </span>
                <span className="font-mono text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-bold tracking-wider uppercase block">
                  ACCOUNT CREATION
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 border border-black bg-[#2DD4BF] text-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0_0_#000]">
              NEW USER
            </span>
          </div>

          {/* Title Section */}
          <div className="space-y-1.5">
            <h1 className="font-heading text-xl sm:text-2xl font-black leading-tight text-black dark:text-white">
              Pick your personal handle.
            </h1>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300 font-sans">
              This is your unique tag for sending, receiving, and tracking peer-to-peer loans with friends.
            </p>
          </div>

          {/* Form Component */}
          <UsernameForm />

          {/* Trust Footer */}
          <div className="mt-6 flex items-center justify-center gap-1.5 border-t-[2px] border-black/10 dark:border-white/10 pt-4 font-mono text-[10px] text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5 text-[#059669] dark:text-[#2DD4BF]" />
            <span>Private by default · End-to-end ledger verification</span>
          </div>
        </RetroWindow>
      </div>
    </main>
  );
}
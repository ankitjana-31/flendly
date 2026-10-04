"use client";

import Link from "next/link";
import { RetroWindow } from "@/components/ui/retro-window";

export function FinalCTAFooter() {
  return (
    <section className="w-full max-w-6xl mx-auto z-10 font-mono">
      <RetroWindow
        title="START WITH FLENDLY"
        subtitle="FINAL STEP"
        colorBar="pink"
        glow={true}
        className="bg-white dark:bg-[var(--card)] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#FF2E93]"
        contentClassName="p-6 sm:p-10 text-center"
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <span className="px-3 py-1 bg-[#FFE600] text-black border-[2px] border-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] rounded-[4px]">
            READY TO LEVEL UP?
          </span>

          <h2 className="font-display text-3xl sm:text-5xl font-bold text-black dark:text-white uppercase tracking-tight">
            Stop overthinking it. Start using Flendly.
          </h2>

          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-sans max-w-2xl font-normal">
            Setup takes 30 seconds. Link with Google. Start sending requests. Watch friendships stay intact while money gets tracked.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 font-mono">
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-[#FFE600] text-black border-[3px] border-black font-mono text-sm sm:text-base font-black uppercase shadow-[4px_4px_0_0_#000] hover:bg-yellow-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 rounded-[10px]"
            >
              <span>[01]</span>
              <span>LAUNCH FLENDLY FREE</span>
            </Link>
            <Link
              href="/"
              className="px-6 py-4 bg-white dark:bg-[var(--muted)] text-black dark:text-white border-[2.5px] border-black dark:border-white font-mono text-sm font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-[#FB7185] hover:text-white dark:hover:bg-[#FB7185] dark:hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 rounded-[10px]"
            >
              <span>◄</span>
              <span>BACK TO HOME</span>
            </Link>
          </div>
        </div>
      </RetroWindow>
    </section>
  );
}

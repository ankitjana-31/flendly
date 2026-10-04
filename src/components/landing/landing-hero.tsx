"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export function LandingHero() {
  const shouldReduceMotion = useReducedMotion();
  const [windowAnimation, setWindowAnimation] = useState<"maximize" | "minimize" | "restore" | "close" | "reopen" | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (animationTimeout.current) clearTimeout(animationTimeout.current);
  }, []);

  const runWindowAnimation = (animation: "maximize" | "minimize" | "restore" | "close" | "reopen") => {
    if (shouldReduceMotion) return;
    if (animationTimeout.current) clearTimeout(animationTimeout.current);
    setWindowAnimation(animation);
    animationTimeout.current = setTimeout(() => {
      animationTimeout.current = null;
      setWindowAnimation(null);
      if (animation === "minimize") setIsMinimized(true);
      if (animation === "reopen") setIsMinimized(false);
    }, animation === "restore" || animation === "reopen" ? 700 : 3600);
  };

  const handleMinimize = () => {
    if (isMinimized) {
      setIsMinimized(false);
      runWindowAnimation("restore");
      return;
    }
    runWindowAnimation("minimize");
  };

  const handleClose = () => {
    runWindowAnimation("close");
    if (!shouldReduceMotion) {
      animationTimeout.current = setTimeout(() => runWindowAnimation("reopen"), 3600);
    }
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full max-w-[1400px] z-20 py-2 sm:py-4"
    >
      {/* Main Hero Window */}
      <div className={`w-full bg-[#FDFBF7] dark:bg-[var(--card)] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#2563EB] flex flex-col transition-colors rounded-[4px] overflow-hidden ${windowAnimation ? `retro-window-${windowAnimation}` : ""}`}>
        {/* Title bar */}
        <div className="h-10 bg-[#2563EB] text-white px-4 border-b-[3px] border-black dark:border-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-wider">
            <span className="w-3.5 h-3.5 bg-[#FFE600] border border-black inline-flex items-center justify-center rounded-[2px]">
              <span className="w-1.5 h-1.5 bg-black rounded-xs" />
            </span>
            <span>FLENDLY // PEER LENDING</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <button type="button" onClick={handleMinimize} aria-label={isMinimized ? "Restore landing window" : "Minimize landing window"} className="retro-win-btn font-mono">
              _
            </button>
            <button type="button" onClick={() => runWindowAnimation("maximize")} aria-label="Zoom landing window" className="retro-win-btn font-mono">
              □
            </button>
            <button type="button" onClick={handleClose} aria-label="Replay landing window" className="retro-win-btn retro-win-btn-close font-mono">
              ✕
            </button>
          </div>
        </div>

        {/* Window Content */}
        {!isMinimized && <div className="p-4 sm:p-6 md:p-8 lg:p-10 grid lg:grid-cols-12 gap-5 lg:gap-8 items-center text-left">
          {/* Left Column (Headline + Actions) */}
          <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-5">
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#2DD4BF] text-black border-[2px] border-black font-mono text-[11px] sm:text-xs font-black shadow-[2px_2px_0_0_#000] uppercase tracking-wider rounded-[6px]">
                <span className="w-2 h-2 rounded-xs bg-black inline-block" />
                <span>LEND IT. LOCK IT. TRACK IT.</span>
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-black dark:text-white leading-[1.12]"
            >
              Some money isn&apos;t a split. It&apos;s a{" "}
              <span className="bg-[#FF2E93] text-white px-2.5 py-0.5 border-[2px] sm:border-[2.5px] border-black shadow-[3px_3px_0_0_#000] inline-block -rotate-1 rounded-[6px]">
                loan.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="font-sans text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 font-normal leading-relaxed max-w-xl"
            >
              Lend to a friend. Agree on the terms. Track every repayment. No more &quot;I&apos;ll pay you back&quot; disappearing into the chat.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 font-mono"
            >
              <Link
                href="/auth/login"
                className="w-full sm:w-auto px-6 py-3 bg-[#FFE600] text-black border-[2.5px] border-black font-mono text-xs sm:text-sm font-black shadow-[3px_3px_0_0_#000] hover:bg-yellow-300 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000] active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000] transition-all flex items-center justify-center gap-2 rounded-[10px]"
              >
                <span>LAUNCH FLENDLY</span>
              </Link>
              <Link
                href="/learn-more"
                className="w-full sm:w-auto px-5 py-3 bg-white dark:bg-[var(--muted)] text-black dark:text-white border-[2.5px] border-black dark:border-white/60 font-mono text-xs sm:text-sm font-bold shadow-[2px_2px_0_0_#000] sm:shadow-[3px_3px_0_0_#000] hover:bg-[#FB7185] hover:text-white dark:hover:bg-[#FB7185] dark:hover:text-white hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000] active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000] transition-all flex items-center justify-center gap-2 group rounded-[10px]"
              >
                <span className="text-[#2563EB] dark:text-[#60A5FA] group-hover:text-white transition-colors font-mono font-black">//</span>
                <span>HOW IT WORKS</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Column — Retro Loan Deal Card */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 flex flex-col gap-3"
          >
            <div className="border-[2.5px] border-black dark:border-white bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[4px_4px_0_0_#000000] flex flex-col rounded-[12px] overflow-hidden">
              {/* Deal Card Header */}
              <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 bg-[#2563EB] border-b-[2px] border-black dark:border-white">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFE600] inline-block" />
                  <span className="font-mono text-[11px] sm:text-xs font-black text-white uppercase tracking-wider">
                    LOAN // ACTIVE
                  </span>
                </div>
                <span className="font-mono text-[9px] sm:text-[10px] bg-[#2DD4BF] text-black px-1.5 py-0.5 border border-black font-black uppercase rounded-[3px]">
                  VERIFIED
                </span>
              </div>

              <div className="p-4 sm:p-5 flex flex-col gap-3">
                {/* Borrower / Lender */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[8px] bg-[#FF2E93] text-white border-[2px] border-black flex items-center justify-center font-display font-bold text-sm shadow-[1.5px_1.5px_0_0_#000]">
                    RH
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 font-display font-bold text-base text-black dark:text-white">
                      <span>Rahul</span>
                      <span className="text-gray-400 font-mono text-xs">→</span>
                      <span>Ankit</span>
                    </div>
                    <span className="font-mono text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold">
                      Mutual Agreement · 3 Oct 2026
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-white dark:bg-[#242938] border-[2px] border-black dark:border-white/40 p-3 flex items-center justify-between rounded-[8px] shadow-[2px_2px_0_0_#000]">
                  <span className="font-mono text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase">
                    Loan Amount
                  </span>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">
                    ₹2,500
                  </span>
                </div>

                {/* Terms Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white dark:bg-[#242938] border-[1.5px] border-black dark:border-white/30 p-2.5 rounded-[8px]">
                    <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">
                      Repay by
                    </span>
                    <span className="font-display text-sm sm:text-base font-bold text-black dark:text-white">
                      18 OCT 2026
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[#242938] border-[1.5px] border-black dark:border-white/30 p-2.5 rounded-[8px]">
                    <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">
                      Interest
                    </span>
                    <span className="font-display text-sm sm:text-base font-bold text-[#10B981]">
                      0%
                    </span>
                  </div>
                </div>

                {/* Status + Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[10px] sm:text-[11px] bg-[#2DD4BF] text-black px-2.5 py-0.5 border-[1.5px] border-black font-black uppercase rounded-[4px] shadow-[1px_1px_0_0_#000]">
                    ACTIVE
                  </span>
                  <span className="font-mono text-[10px] sm:text-[11px] text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase underline underline-offset-2 cursor-default">
                    VIEW AGREEMENT →
                  </span>
                </div>
              </div>
            </div>

            {/* Tagline below card */}
            <div className="bg-[#FFE600] border-[2px] border-black p-2.5 text-center font-mono text-[11px] sm:text-xs font-black text-black shadow-[2px_2px_0_0_#000] rounded-[8px]">
              YOUR MONEY DESERVES MORE THAN A WHATSAPP MESSAGE
            </div>
          </motion.div>
        </div>}
      </div>
    </motion.section>
  );
}

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
      {/* Stitch HERO_PROMISE.exe Main Window */}
      <div className={`w-full bg-[#FDFBF7] dark:bg-[var(--card)] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#2563EB] flex flex-col transition-colors rounded-sm overflow-hidden ${windowAnimation ? `retro-window-${windowAnimation}` : ""}`}>
        {/* Title bar */}
        <div className="h-10 bg-[#2563EB] text-white px-4 border-b-[3px] border-black dark:border-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-wider">
            <span className="w-4 h-4 bg-[#FFE600] border border-black inline-flex items-center justify-center text-[10px] text-black font-bold">
              ▲
            </span>
            <span>THE PROMISE</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <button type="button" onClick={handleMinimize} aria-label={isMinimized ? "Restore landing window" : "Minimize landing window"} className="retro-win-btn">
              _
            </button>
            <button type="button" onClick={() => runWindowAnimation("maximize")} aria-label="Zoom landing window" className="retro-win-btn">
              □
            </button>
            <button type="button" onClick={handleClose} aria-label="Replay landing window" className="retro-win-btn retro-win-btn-close">
              ✕
            </button>
          </div>
        </div>

        {/* Window Content */}
        {!isMinimized && <div className="p-6 md:p-8 lg:p-10 grid lg:grid-cols-12 gap-6 lg:gap-8 items-center text-left">
          {/* Left Column (Headline + Actions) */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#2DD4BF] text-black border-[2px] border-black font-mono text-xs font-black shadow-[2px_2px_0_0_#000] uppercase tracking-wider">
                <span>⚡</span>
                <span>NO MORE AWKWARD CHAT TEXTS</span>
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-black dark:text-white leading-[1.1]"
            >
              Money between friends shouldn&apos;t become a{" "}
              <span className="bg-[#FF2E93] text-white px-2.5 py-0.5 border-[2.5px] border-black shadow-[3px_3px_0_0_#000] inline-block -rotate-1">
                friendship
              </span>{" "}
              problem.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed max-w-xl"
            >
              Track split expenses, informal loans, and IOUs without awkward reminders, endless screenshots, or broken trust.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3 pt-2 font-mono"
            >
              <Link
                href="/auth/login"
                className="px-6 py-3 bg-[#FFE600] text-black border-[2.5px] border-black font-mono text-sm font-black shadow-[4px_4px_0_0_#000] hover:bg-yellow-300 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#000] active:translate-y-0.5 active:shadow-[2px_2px_0_0_#000] transition-all flex items-center gap-2"
              >
                <span>LAUNCH FLENDLY</span>
              </Link>
              {/* Pink liquid fill for How It Works button */}
              <Link
                href="/learn-more"
                className="px-5 py-3 bg-white dark:bg-[var(--muted)] text-black dark:text-white border-[2.5px] border-black dark:border-white/60 font-mono text-sm font-bold shadow-[4px_4px_0_0_#000] hover:bg-[#FB7185] hover:text-white dark:hover:bg-[#FB7185] dark:hover:text-white hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#000] active:translate-y-0.5 active:shadow-[2px_2px_0_0_#000] transition-all flex items-center gap-2 group"
              >
                <span className="text-[#2563EB] dark:text-[#60A5FA] group-hover:text-white transition-colors">ℹ</span>
                <span>HOW IT WORKS</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Column (Retro OS Diagnostic Widget) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 flex flex-col gap-3 font-mono"
          >
            <div className="border-[2.5px] border-black dark:border-white bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[4px_4px_0_0_#000000] p-4 flex flex-col gap-3">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b-[2px] border-black dark:border-white/40 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#F43F5E] inline-block border border-black" />
                  <span className="text-xs font-black text-black dark:text-white uppercase tracking-wider">
                    LEAK DIAGNOSTIC
                  </span>
                </div>
                  <span className="text-[10px] text-gray-500 font-bold">STATUS<span className="hidden sm:inline"> // ACTIVE</span></span>
              </div>

              {/* Chat Simulation - Rahul and cab share of 250 */}
              <div className="bg-white dark:bg-[#242938] border-[2.5px] border-black dark:border-white/40 p-3.5 shadow-[3px_3px_0_0_#000]">
                <div className="text-xs text-gray-600 dark:text-gray-300 font-bold mb-1 flex items-center justify-between">
                  <span>Rahul (3 months ago via WhatsApp):</span>
                  <span className="text-[9.5px] bg-[#FFE600] text-black px-1.5 py-0.5 border border-black font-black uppercase">UNPAID</span>
                </div>
                <p className="text-sm font-semibold text-black dark:text-white italic leading-snug">
                  &quot;Bro, will pay my ₹250 for the cab share tomorrow morning!&quot;
                </p>
              </div>

              {/* Consequence Alert */}
              <div className="p-3 bg-[#FF2E93]/15 border-[2px] border-[#F43F5E] text-xs font-bold text-black dark:text-white flex items-center gap-2.5">
                <span className="text-[#F43F5E] text-base">⚠️</span>
                <div>
                  <div className="text-[#F43F5E] font-black uppercase text-[11px]">TOMORROW WAS 90 DAYS AGO</div>
                  <div className="text-gray-600 dark:text-gray-300 text-[10px]">Unrecovered informal loan · Friendship strained</div>
                </div>
              </div>

              {/* Live Metric */}
              <div className="bg-white dark:bg-[#242938] border-[2px] border-black dark:border-white/40 p-3 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase">UNPAID BALANCE:</span>
                <span className="text-base font-black text-[#F43F5E] bg-[#FF2E93]/15 px-2 py-0.5 border border-[#F43F5E]">
                  ₹250.00
                </span>
              </div>

              <div className="bg-[#2DD4BF] border-[2px] border-black p-2 text-center text-xs font-black text-black shadow-[2px_2px_0_0_#000]">
                ⚡ AUTO-REMIND WITHOUT AWKWARDNESS
              </div>
            </div>
          </motion.div>
        </div>}
      </div>
    </motion.section>
  );
}

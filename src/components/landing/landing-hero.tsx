"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import React from "react";

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

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full max-w-6xl z-20 py-4 sm:py-8"
    >
      {/* Stitch HERO_PROMISE.exe Main Window */}
      <div className="w-full bg-[#FDFBF7] dark:bg-[#161821] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#2563EB] flex flex-col transition-colors rounded-sm overflow-hidden">
        {/* Title bar */}
        <div className="h-10 bg-[#2563EB] text-white px-4 border-b-[3px] border-black dark:border-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-wider">
            <span className="w-4 h-4 bg-[#FFE600] border border-black inline-flex items-center justify-center text-[10px] text-black font-bold">
              ▲
            </span>
            <span>HERO_PROMISE.exe</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 border border-black dark:border-white bg-white text-black font-mono text-[10px] font-bold flex items-center justify-center">
              _
            </span>
            <span className="w-5 h-5 border border-black dark:border-white bg-white text-black font-mono text-[10px] font-bold flex items-center justify-center">
              □
            </span>
            <span className="w-5 h-5 border border-black dark:border-white bg-[#F43F5E] text-white font-mono text-[10px] font-bold flex items-center justify-center">
              ✕
            </span>
          </div>
        </div>

        {/* Window Content */}
        <div className="p-8 md:p-12 lg:p-14 grid lg:grid-cols-12 gap-10 items-center text-left">
          {/* Left Column (Headline + Actions) */}
          <div className="lg:col-span-7 flex flex-col gap-7">
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#2DD4BF] text-black border-[2px] border-black font-mono text-xs font-black shadow-[2px_2px_0_0_#000] uppercase tracking-wider">
                <span>⚡</span>
                <span>NO MORE AWKWARD CHAT TEXTS</span>
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-black dark:text-white leading-[1.1]"
            >
              Money between friends shouldn&apos;t become a{" "}
              <span className="bg-[#FF2E93] text-white px-3 py-0.5 border-[2.5px] border-black shadow-[4px_4px_0_0_#000] inline-block -rotate-1">
                friendship
              </span>{" "}
              problem.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-gray-700 dark:text-gray-200 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl font-normal"
            >
              Track split expenses, informal loans, and IOUs without awkward reminders, endless screenshots, or broken trust.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                href="/auth/login"
                className="px-8 py-4 bg-[#FFE600] text-black border-[3px] border-black font-mono text-sm sm:text-base font-black uppercase shadow-[4px_4px_0_0_#000] hover:bg-yellow-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2.5"
              >
                <span>⚡</span>
                <span>BOOT FLENDLY DESKTOP</span>
              </Link>
              <Link
                href="/learn-more"
                className="px-7 py-4 bg-[#2563EB] text-white border-[2.5px] border-black dark:border-white font-mono text-sm sm:text-base font-bold uppercase shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#ffffff] hover:bg-blue-600 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
              >
                <span>ℹ</span>
                <span>HOW IT WORKS</span>
              </Link>
            </motion.div>

            {/* Feature Bullets */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-5 pt-2 font-mono text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-bold"
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#10B981] inline-block border border-black" />
                <span>Zero Awkward Calls</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#FFE600] inline-block border border-black" />
                <span>Mutual Agreements</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#2563EB] inline-block border border-black" />
                <span>Direct UPI Ledger</span>
              </span>
            </motion.div>
          </div>

          {/* Right Column: Diagnostic Leak Dilemma Card */}
          <div className="lg:col-span-5">
            <motion.div
              variants={itemVariants}
              className="w-full bg-white dark:bg-[#1E212D] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#FFE600] rounded-sm overflow-hidden"
            >
              {/* Card Titlebar */}
              <div className="h-9 bg-[#F43F5E] text-white px-3.5 border-b-[2.5px] border-black dark:border-white flex items-center justify-between font-mono text-xs font-bold uppercase select-none">
                <span className="flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>LEAK_DIAGNOSTIC.tmp</span>
                </span>
                <span className="w-4 h-4 bg-white text-black text-[10px] font-bold flex items-center justify-center border border-black">
                  ✕
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 font-mono text-xs sm:text-sm">
                <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#161821] border-[2px] border-black dark:border-gray-700 shadow-[2px_2px_0_0_#000]">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-bold">
                    Rohit (3 months ago via WhatsApp):
                  </div>
                  <p className="italic text-gray-900 dark:text-white font-sans text-sm leading-relaxed">
                    &ldquo;Bro, will pay my ₹500 for the Goa trip dinner booking tomorrow morning!&rdquo;
                  </p>
                </div>

                <div className="p-3.5 bg-[#FF2E93]/15 border-[2px] border-[#F43F5E] text-[#9F1239] dark:text-[#FDA4AF] flex items-center gap-3 shadow-[2px_2px_0_0_#000]">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#F43F5E]">TOMORROW WAS 90 DAYS AGO</div>
                    <div className="text-xs opacity-90 font-sans text-gray-700 dark:text-gray-300">Unrecovered informal loan · Friendship strained</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] dark:bg-[#161821] border-[2px] border-black dark:border-gray-700 shadow-[2px_2px_0_0_#000]">
                  <span className="text-gray-700 dark:text-gray-300 font-black uppercase text-xs">UNPAID BALANCE:</span>
                  <span className="text-2xl font-black text-[#F43F5E] bg-white dark:bg-[#242938] px-3 py-0.5 border border-black">₹500.00</span>
                </div>

                <button
                  type="button"
                  className="w-full py-3 bg-[#2DD4BF] hover:bg-[#10B981] text-black border-[2.5px] border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 transition-all cursor-default"
                >
                  <span>⚡</span>
                  <span>AUTO-REMIND WITHOUT AWKWARDNESS</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

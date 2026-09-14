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
      className="relative w-full max-w-5xl text-center z-20 py-8 sm:py-12"
    >
      {/* Retro OS Header Pill */}
      <motion.div variants={itemVariants} className="mb-8 flex justify-center">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-teal-500/30 bg-[#121822]/90 text-teal-300 text-xs font-mono tracking-wider shadow-lg shadow-teal-500/10 retro-raised backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#FF5F56]" />
            <span className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
            <span className="h-2 w-2 rounded-full bg-[#27C93F]" />
          </div>
          <span className="text-slate-400">|</span>
          <span className="font-semibold text-teal-300">FLENDLY OS v1.0 // P2P LEDGER</span>
        </div>
      </motion.div>

      {/* Main Retro Headline */}
      <motion.div variants={itemVariants} className="mb-4">
        <h1 className="font-mono text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white select-none">
          FLENDLY
        </h1>
        <div className="font-mono text-sm sm:text-base md:text-lg text-teal-400 tracking-widest mt-2 uppercase font-semibold">
          Peer-to-Peer Lending, Simple & Safe
        </div>
      </motion.div>

      {/* Subheading in clean retro container */}
      <motion.p
        variants={itemVariants}
        className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300 mb-10 mt-6 font-sans"
      >
        Lend money without the drama. No screenshots, no memory games, no awkward reminders.
        Just a shared ledger that keeps you and your people honest.
      </motion.p>

      {/* Retro Action Buttons with Glass Hover */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4 justify-center relative z-30 mb-16"
      >
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          className="inline-block"
        >
          <Link
            href="/auth/login"
            className="group relative inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-8 font-mono text-sm font-bold text-slate-950 transition-all duration-300 retro-raised hover:shadow-[0_0_25px_rgba(45,212,191,0.4)]"
          >
            <span>►</span>
            <span>GET STARTED</span>
          </Link>
        </motion.div>

        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          className="inline-block"
        >
          <Link
            href="/learn-more"
            className="group relative inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#141B26]/80 backdrop-blur-md px-8 font-mono text-sm font-semibold text-slate-200 transition-all duration-300 retro-raised hover:border-teal-400/50 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_0_20px_rgba(45,212,191,0.15)]"
          >
            <span>ℹ</span>
            <span>HOW IT WORKS</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Trust Indicators in Retro Stat Boxes */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left"
      >
        <div className="p-4 rounded-xl border border-[#1E2935] bg-[#0E131A]/80 backdrop-blur-md shadow-lg transition-all duration-200 hover:border-teal-500/40 retro-raised">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-[11px] text-slate-400">
            <span>[METRIC_01]</span>
            <span className="text-teal-400 font-semibold">VERIFIED</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-mono font-black text-teal-400">100%</div>
            <div className="text-xs text-slate-300 font-mono mt-1 uppercase">Transparent Ledger</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#1E2935] bg-[#0E131A]/80 backdrop-blur-md shadow-lg transition-all duration-200 hover:border-cyan-500/40 retro-raised">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-[11px] text-slate-400">
            <span>[METRIC_02]</span>
            <span className="text-cyan-400 font-semibold">ACTIVE</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-400">Real-Time</div>
            <div className="text-xs text-slate-300 font-mono mt-1 uppercase">Dual Confirmation</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#1E2935] bg-[#0E131A]/80 backdrop-blur-md shadow-lg transition-all duration-200 hover:border-indigo-500/40 retro-raised">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-[11px] text-slate-400">
            <span>[METRIC_03]</span>
            <span className="text-indigo-400 font-semibold">FREE</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-mono font-black text-indigo-400">₹0.00</div>
            <div className="text-xs text-slate-300 font-mono mt-1 uppercase">Zero Hidden Fees</div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

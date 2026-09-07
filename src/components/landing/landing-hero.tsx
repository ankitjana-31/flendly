"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import React from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 26 },
  },
};

export function LandingHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full max-w-4xl text-center z-20"
    >
      {/* FLENDLY Brand Name with subtle sheen */}
      <motion.div variants={itemVariants} className="relative mb-6">
        <h1 className="font-brand text-6xl sm:text-8xl md:text-9xl font-bold tracking-wider uppercase select-none group">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-blue-50 to-blue-200 transition-all duration-300 group-hover:drop-shadow-[0_0_30px_rgba(45,212,191,0.4)]">
            FLENDLY
          </span>
        </h1>
      </motion.div>

      <motion.h2
        variants={itemVariants}
        className="font-heading text-3xl sm:text-5xl font-bold leading-tight text-white mb-6"
      >
        Split the awkward. Keep the friendship.
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400">
          Track every rupee.
        </span>
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="mx-auto max-w-2xl text-lg leading-8 text-slate-300 mb-12"
      >
        Lend money without the drama. No screenshots, no memory games, no awkward reminders.
        Just a shared ledger that keeps you and your people honest.
      </motion.p>

      {/* Buttons with cool hover animations */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center relative z-30">
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          className="inline-block pointer-events-auto"
        >
          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-teal-400 px-8 text-sm font-bold text-black transition-all duration-300 hover:shadow-2xl hover:shadow-teal-400/40 hover:brightness-110 active:scale-[0.98]"
          >
            Start for free
          </Link>
        </motion.div>

        {/* Empty-Inside Glowing Border Hover Button */}
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          className="inline-block pointer-events-auto"
        >
          <Link
            href="/learn-more"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 backdrop-blur-md px-8 text-sm font-semibold text-white transition-all duration-300 hover:bg-transparent hover:border-teal-400 hover:text-teal-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.25)]"
          >
            See how it works
          </Link>
        </motion.div>
      </motion.div>

      {/* Feature Micro-Badges with Glassy Hover */}
      <motion.div
        variants={itemVariants}
        className="mt-16 flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-slate-400"
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/5 bg-white/3 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300 hover:-translate-y-0.5 cursor-default">
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
          <span>Secure & Private</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/5 bg-white/3 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300 hover:-translate-y-0.5 cursor-default">
          <div className="h-2 w-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
          <span>Easy Setup</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/5 bg-white/3 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300 hover:-translate-y-0.5 cursor-default">
          <div className="h-2 w-2 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
          <span>Transparent Tracking</span>
        </div>
      </motion.div>
    </motion.section>
  );
}

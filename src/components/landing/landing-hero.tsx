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
      delayChildren: 0.1,
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
      className="relative w-full max-w-4xl text-center z-20"
    >
      {/* FLENDLY Brand Name */}
      <motion.div variants={itemVariants} className="relative mb-6">
        <h1 className="font-brand text-6xl sm:text-8xl md:text-9xl font-bold tracking-wider uppercase select-none">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-zinc-950 via-slate-800 to-blue-900 dark:from-white dark:via-blue-50 dark:to-blue-200 drop-shadow-sm">
            FLENDLY
          </span>
        </h1>
      </motion.div>

      <motion.h2
        variants={itemVariants}
        className="font-heading text-3xl sm:text-5xl font-bold leading-tight text-zinc-900 dark:text-white mb-6"
      >
        Split the awkward. Keep the friendship.
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400">
          Track every rupee.
        </span>
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="mx-auto max-w-2xl text-lg leading-8 text-zinc-600 dark:text-slate-300 mb-12"
      >
        Lend money without the drama. No screenshots, no memory games, no awkward reminders.
        Just a shared ledger that keeps you and your people honest.
      </motion.p>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center relative z-30">
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
          className="inline-block pointer-events-auto"
        >
          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 dark:bg-blue-500 px-8 text-sm font-semibold text-white transition-all hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/40"
          >
            Start for free
          </Link>
        </motion.div>

        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
          className="inline-block pointer-events-auto"
        >
          <Link
            href="/learn-more"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 backdrop-blur px-8 text-sm font-semibold text-zinc-900 dark:text-white transition-all hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
          >
            See how it works
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-16 flex justify-center gap-8 text-sm text-zinc-500 dark:text-slate-400"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          <span>Secure & Private</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400" />
          <span>Easy Setup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400" />
          <span>Transparent Tracking</span>
        </div>
      </motion.div>
    </motion.section>
  );
}

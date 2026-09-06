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
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-blue-50 to-blue-200">
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
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
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

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center relative z-30">
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
          className="inline-block pointer-events-auto"
        >
          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-500 px-8 text-sm font-semibold text-white transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
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
            className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-500 px-8 text-sm font-semibold text-white transition-all hover:border-blue-400 hover:text-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            See how it works
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-16 flex justify-center gap-8 text-sm text-slate-400"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>Secure & Private</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-400" />
          <span>Easy Setup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-purple-400" />
          <span>Transparent Tracking</span>
        </div>
      </motion.div>
    </motion.section>
  );
}

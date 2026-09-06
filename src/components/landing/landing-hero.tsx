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
      {/* Badge with subtle glow */}
      <motion.div variants={itemVariants} className="mb-4 inline-block">
        <div className="relative inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-blue-300 uppercase">
            Personal Finance Ledger
          </span>
        </div>
      </motion.div>

      {/* Big, Bold & Glowy Signature FLENDLY Brand Name */}
      <motion.div variants={itemVariants} className="relative mb-6">
        {/* Multi-tier ambient neon glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-96 rounded-full bg-gradient-to-r from-blue-600/40 via-indigo-500/30 to-cyan-400/40 blur-3xl -z-10" />
        
        <h1 className="font-brand text-6xl sm:text-8xl md:text-9xl font-black tracking-tight uppercase select-none">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-blue-50 to-blue-200 drop-shadow-[0_0_35px_rgba(59,130,246,0.7)]">
            FLENDLY
          </span>
        </h1>
      </motion.div>

      <motion.h2
        variants={itemVariants}
        className="font-heading text-3xl sm:text-5xl font-bold leading-tight text-white mb-6"
      >
        Make every loan between people
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
          crystal clear
        </span>
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="mx-auto max-w-2xl text-lg leading-8 text-slate-300 mb-12"
      >
        Flendly helps you create, track, and manage personal lending and borrowing.
        No approvals. No complicated terms. Just clear agreements and transparent repayments
        with the people you trust.
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
            Get Started
          </Link>
        </motion.div>

        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
          className="inline-block pointer-events-auto"
        >
          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-500 px-8 text-sm font-semibold text-white transition-all hover:border-blue-400 hover:text-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            Learn More
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

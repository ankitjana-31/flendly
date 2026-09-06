"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import React from "react";
import { MorphingText } from "@/components/ui/morphing-text";

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

  const morphingTexts = [
    "Clear agreements",
    "Zero confusion",
    "Transparent tracking",
    "Shared trust",
    "Personal control",
  ];

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full max-w-4xl text-center z-20"
    >
      <motion.p
        variants={itemVariants}
        className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-6"
      >
        Personal Finance Ledger
      </motion.p>

      <motion.h1
        variants={itemVariants}
        className="font-heading text-5xl sm:text-6xl font-bold leading-tight text-white mb-6"
      >
        Make every loan between people
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
          crystal clear
        </span>
      </motion.h1>

      <motion.div
        variants={itemVariants}
        className="mb-8"
      >
        <MorphingText
          texts={morphingTexts}
          className="text-blue-300 text-2xl"
        />
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="mx-auto max-w-2xl text-lg leading-8 text-slate-300 mb-12"
      >
        Flendly helps you create, track, and manage personal lending and borrowing.
        No approvals. No complicated terms. Just clear agreements and transparent repayments
        with the people you trust.
      </motion.p>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/auth/login" className="inline-block">
          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-500 px-8 text-sm font-semibold text-white transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            type="button"
          >
            Get Started
          </motion.button>
        </Link>

        <Link href="/auth/login" className="inline-block">
          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-500 px-8 text-sm font-semibold text-white transition-all hover:border-blue-400 hover:text-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            type="button"
          >
            Learn More
          </motion.button>
        </Link>
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

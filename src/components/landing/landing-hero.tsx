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
      className="relative w-full max-w-2xl text-center"
    >
      <motion.div
        variants={itemVariants}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.05, rotate: 2 }}
        className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-heading text-xl font-bold text-primary-foreground shadow-sm cursor-default"
      >
        F
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="text-sm font-semibold uppercase tracking-wider text-accent"
      >
        Flendly
      </motion.p>

      <motion.h1
        variants={itemVariants}
        className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl"
      >
        Friendly lending, clear records.
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground"
      >
        Negotiate terms, track interest accurately, and maintain one shared ledger
        with people you already trust — instead of mental notes or screenshots.
      </motion.p>

      <motion.div variants={itemVariants} className="mt-8">
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="inline-block"
        >
          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent shadow-sm"
          >
            Continue with Google
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

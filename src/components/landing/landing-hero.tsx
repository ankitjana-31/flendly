"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import React from "react";
import { MorphingText } from "@/components/ui/morphing-text";
import { BorderBeam } from "@/components/ui/border-beam";

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
    "Friendly lending",
    "Clear records",
    "Easy tracking",
    "Shared ledger",
    "Trust matters",
  ];

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full max-w-4xl text-center"
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

      <motion.div
        variants={itemVariants}
        className="mt-6 mb-8"
      >
        <MorphingText
          texts={morphingTexts}
          className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500"
        />
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="mx-auto mt-8 max-w-xl text-lg leading-8 text-muted-foreground"
      >
        Negotiate terms, track interest accurately, and maintain one shared ledger
        with people you already trust — instead of mental notes or screenshots.
      </motion.p>

      <motion.div variants={itemVariants} className="mt-12">
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-0 blur-xl group-hover:opacity-100 transition-opacity duration-500" />
          <Link
            href="/auth/login"
            className="relative inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent shadow-lg hover:shadow-xl hover:shadow-primary/50"
          >
            Get Started
            <BorderBeam
              size={100}
              duration={8}
              colorFrom="#ffaa40"
              colorTo="#9c40ff"
            />
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-16 flex justify-center gap-8 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span>Secure & Private</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <span>Easy Setup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-warning" />
          <span>Fast Tracking</span>
        </div>
      </motion.div>
    </motion.section>
  );
}

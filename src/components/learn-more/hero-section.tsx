"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function LearnMoreHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `linear-gradient(rgba(45,212,191,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.3) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-gradient-to-br from-teal-500/15 via-blue-600/15 to-purple-600/10 blur-3xl pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-block text-[#2DD4BF] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10">
            The Problem Is Real
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight mb-8"
        >
          <span className="block text-white">Your mate borrowed ₹500</span>
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#2DD4BF] via-[#60A5FA] to-[#C084FC]">
            It's been 6 months.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed text-[#94A3B8] mb-12"
        >
          That awkward text never came. The friendship is still intact, but so is the memory of that ₹500. Sound familiar? You're not alone. We built Flendly to kill this vibe.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/auth/login"
            className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#60A5FA] px-8 text-base font-bold text-[#0B0F14] transition-all hover:shadow-2xl hover:shadow-teal-500/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            Let's Fix This
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-xl border border-[#1E2935] bg-[#111820]/80 backdrop-blur px-8 text-base font-semibold text-white transition-all hover:bg-[#1E2935] hover:border-teal-500/30"
          >
            Back to Landing
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

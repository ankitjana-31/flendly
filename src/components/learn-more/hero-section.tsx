"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RetroWindow } from "@/components/ui/retro-window";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function LearnMoreHero() {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-10 w-full max-w-6xl mx-auto"
    >
      <RetroWindow
        title="PROBLEM_STATEMENT.exe // WHY_WE_BUILT_THIS"
        subtitle="v2.4"
        colorBar="blue"
        glow={true}
        className="bg-[#FDFBF7] dark:bg-[#161821] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#2563EB]"
        contentClassName="p-6 sm:p-8 md:p-10 text-left"
        headerRight={
          <div className="flex items-center gap-2 font-mono text-xs text-white bg-black/20 px-2 py-0.5 border border-white/30 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-pulse" />
            <span>REAL_TALK</span>
          </div>
        }
      >
        <motion.div variants={itemVariants} className="mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#2DD4BF] text-black border-[2px] border-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000]">
            <span>⚡</span>
            <span>THE REALITY CHECK</span>
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black dark:text-white leading-[1.1] tracking-tight mb-5"
        >
          Your mate borrowed ₹500.{" "}
          <span className="bg-[#FF2E93] text-white px-3 py-0.5 border-[2.5px] border-black shadow-[4px_4px_0_0_#000] inline-block -rotate-1">
            It&apos;s been 6 months.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl leading-relaxed text-gray-700 dark:text-gray-200 max-w-3xl mb-6 font-normal"
        >
          That awkward text never came. The friendship is still intact, but so is the lingering memory of that ₹500. Sound familiar? We built Flendly to kill this awkwardness forever.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center gap-3 pt-1"
        >
          <Link
            href="/auth/login"
            className="px-6 py-3.5 bg-[#FFE600] text-black border-[3px] border-black font-mono text-xs sm:text-sm font-black uppercase shadow-[3px_3px_0_0_#000] hover:bg-yellow-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
          >
            <span>⚡</span>
            <span>LET&apos;S FIX THIS</span>
          </Link>
          <Link
            href="/"
            className="px-6 py-3.5 bg-white dark:bg-[#1E212D] text-black dark:text-white border-[2.5px] border-black dark:border-white font-mono text-xs sm:text-sm font-bold uppercase shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#ffffff] hover:bg-gray-100 dark:hover:bg-gray-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
          >
            <span>◄</span>
            <span>BACK TO HOME</span>
          </Link>
        </motion.div>
      </RetroWindow>
    </motion.section>
  );
}

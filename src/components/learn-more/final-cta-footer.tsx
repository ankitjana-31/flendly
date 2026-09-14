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

export function FinalCTAFooter() {
  return (
    <section className="w-full max-w-6xl mx-auto z-10">
      <RetroWindow
        title="SYSTEM BOOT // GET STARTED"
        subtitle="v2.4"
        colorBar="green"
        glow={true}
        className="bg-[#FDFBF7] dark:bg-[#161821] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#059669]"
        contentClassName="p-6 sm:p-10 text-center"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-block px-3 py-1 bg-[#FFE600] text-black border-[2px] border-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000]">
              READY TO LAUNCH
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-5xl md:text-6xl font-black text-black dark:text-white mb-4 leading-tight tracking-tight uppercase"
          >
            Stop overthinking it.{" "}
            <span className="bg-[#2563EB] text-white px-3 py-0.5 border-[2.5px] border-black shadow-[4px_4px_0_0_#000] inline-block -rotate-1">
              Start using Flendly.
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-gray-700 dark:text-gray-200 text-lg sm:text-xl max-w-2xl mx-auto mb-6 leading-relaxed font-normal"
          >
            Setup takes 30 seconds. One click with Google. Start sending requests. Watch friendships stay intact while money gets tracked.
          </motion.p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap gap-3 justify-center items-center mb-6"
          >
            <motion.div variants={itemVariants}>
              <Link
                href="/auth/login"
                className="px-6 py-3.5 bg-[#FFE600] text-black border-[3px] border-black font-mono text-xs sm:text-sm font-black uppercase shadow-[3px_3px_0_0_#000] hover:bg-yellow-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
              >
                <span>⚡</span>
                <span>LAUNCH FLENDLY FREE</span>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                href="/"
                className="px-6 py-3.5 bg-white dark:bg-[#1E212D] text-black dark:text-white border-[2.5px] border-black dark:border-white font-mono text-xs sm:text-sm font-bold uppercase shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#ffffff] hover:bg-gray-100 dark:hover:bg-gray-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
              >
                <span>◄</span>
                <span>BACK TO HOME</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-6 justify-center items-center font-mono text-xs text-gray-600 dark:text-gray-400 pt-6 border-t-[2px] border-black/10 dark:border-white/10"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#10B981] border border-black inline-block" />
              <span className="font-bold text-black dark:text-white">NO CREDIT CARD REQUIRED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#FFE600] border border-black inline-block" />
              <span className="font-bold text-black dark:text-white">ENCRYPTED REALTIME LEDGER</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#2563EB] border border-black inline-block" />
              <span className="font-bold text-black dark:text-white">100% PRIVATE DATA</span>
            </div>
          </motion.div>
        </motion.div>
      </RetroWindow>
    </section>
  );
}

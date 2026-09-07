"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
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

export function FinalCTAFooter() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-br from-teal-500/10 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 max-w-4xl mx-auto text-center"
      >
        <motion.h2
          variants={itemVariants}
          className="font-heading text-4xl sm:text-6xl md:text-7xl font-black text-white mb-8 leading-tight"
        >
          <span className="block mb-4">Stop overthinking it.</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2DD4BF] via-[#60A5FA] to-[#C084FC]">
            Start using Flendly.
          </span>
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-[#94A3B8] text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Setup takes 30 seconds. Link with Google. Start sending requests. Watch friendships stay intact while money gets tracked.
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <motion.div variants={itemVariants}>
            <Link
              href="/auth/login"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#60A5FA] px-10 text-base font-bold text-[#0B0F14] transition-all hover:shadow-2xl hover:shadow-teal-500/30 hover:-translate-y-1 active:translate-y-0 shadow-lg shadow-teal-500/20"
            >
              Launch Flendly Free
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link
              href="/"
              className="inline-flex h-14 items-center justify-center rounded-xl border border-[#1E2935] bg-[#111820]/80 backdrop-blur px-10 text-base font-semibold text-white transition-all hover:bg-[#1E2935] hover:border-teal-500/40"
            >
              Back to Home
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-[#94A3B8] pt-8 border-t border-[#1E2935]"
        >
          <div className="flex items-center gap-2">
            <span className="text-teal-400">✓</span>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-teal-400">✓</span>
            <span>Encrypted with Supabase</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-teal-400">✓</span>
            <span>100% private</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center text-xs text-[#94A3B8] mt-16 relative z-10"
      >
        Built with ❤️ for friends who shouldn't let money ruin their vibe.
      </motion.p>
    </section>
  );
}

"use client";

import { GalleryHeading } from "@/components/threeui/gallery-heading";
import { motion } from "framer-motion";

export function GalleryHeadingSection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.3 }}
      className="relative w-full py-24 overflow-hidden"
    >
      {/* Canvas Animation */}
      <div className="relative w-full h-[600px] sm:h-[700px] lg:h-[800px] rounded-2xl overflow-hidden border border-slate-800/50">
        <GalleryHeading
          headline={{
            line1: "SECURE LENDING",
            line2: "SHARED LEDGER",
          }}
          className="h-full"
        />
      </div>

      {/* Decorative Gradient Overlay (top) */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0B0F14] to-transparent pointer-events-none" />

      {/* Decorative Gradient Overlay (bottom) */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0B0F14] to-transparent pointer-events-none" />

      {/* Caption */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-center mt-8"
      >
        <p className="text-sm text-slate-400 uppercase tracking-widest">
          Premium Canvas Experience · Rising Diagonal Animation
        </p>
      </motion.div>
    </motion.section>
  );
}

"use client";

import { motion } from "framer-motion";
import { RetroWindow } from "@/components/ui/retro-window";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const archetypes = [
  {
    name: "The Silent Sufferer",
    tag: "RESENTMENT_OVERFLOW",
    behavior: "Lent ₹15,000 for a trip deposit. Never brought it up again. Silently counts it every single time you meet for brunch.",
    vibe: "Passive aggressive energy",
    tagColor: "bg-[#2563EB] text-white",
  },
  {
    name: "The Text Nagger",
    tag: "AWKWARD_PING_SPAM",
    behavior: "Sends follow-up pings every single week. Ruins the friendship dynamic. Still only half-paid after 4 months.",
    vibe: "Constant notifications",
    tagColor: "bg-[#F43F5E] text-white",
  },
  {
    name: "The Ghost",
    tag: "COMMUNICATION_BREAKDOWN",
    behavior: "Borrowed ₹8,000. Changed their number. Moved to a new city. You see them thriving in Goa on Instagram stories.",
    vibe: "Completely vanished",
    tagColor: "bg-[#FFE600] text-black",
  },
  {
    name: "The Over-Promiser",
    tag: "RECURRING_EXCUSES",
    behavior: "Swears they will GPay next Friday. Then next month. Then when bonus credits. Spoiler: tonight never comes.",
    vibe: "Infinite postponements",
    tagColor: "bg-[#2DD4BF] text-black",
  },
];

export function LoanAnatomySection() {
  return (
    <section className="w-full max-w-6xl mx-auto z-10">
      <RetroWindow
        title="PSYCHOLOGY_AUDIT.sys // THE_FRIEND_SQUAD"
        subtitle="v2.4"
        colorBar="pink"
        className="bg-white dark:bg-[#161821] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#F43F5E]"
        contentClassName="p-8 sm:p-12"
      >
        <div className="mb-10 text-left">
          <span className="inline-block px-3 py-1 bg-[#F43F5E] text-white border-[2px] border-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] mb-4">
            SOCIAL_DYNAMIC_FAILURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-black dark:text-white uppercase tracking-tight">
            The Anatomy of a Forgotten Loan
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg sm:text-xl mt-3 max-w-3xl leading-relaxed">
            Ever lend money to a friend? One of these four exact archetypes always unfolds without a structured agreement.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {archetypes.map((archetype, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="border-[2.5px] border-black dark:border-white/50 bg-[#FAF8F5] dark:bg-[#1E212D] p-6 sm:p-8 shadow-[4px_4px_0_0_#000000] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] flex flex-col justify-between text-left transition-all hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-0.5 border border-black font-mono text-[10px] font-bold uppercase shadow-[1px_1px_0_0_#000] ${archetype.tagColor}`}>
                    {archetype.tag}
                  </span>
                  <span className="font-mono text-xs font-bold text-gray-500">#{idx + 1}</span>
                </div>
                <h3 className="text-2xl font-black text-black dark:text-white mb-3">{archetype.name}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-6 font-normal">
                  {archetype.behavior}
                </p>
              </div>

              <div className="pt-4 border-t-[2px] border-black/10 dark:border-white/10 flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-gray-600 dark:text-gray-400">THE VIBE:</span>
                <span className="font-bold text-black dark:text-white bg-black/5 dark:bg-white/10 px-2 py-0.5 border border-black/20">{archetype.vibe}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 p-5 border-[2px] border-black bg-[#FFE600]/20 dark:bg-[#2E2800] shadow-[3px_3px_0_0_#000000] flex items-center gap-4 text-left">
          <span className="text-2xl">⚠️</span>
          <p className="font-mono text-sm sm:text-base font-bold text-black dark:text-white">
            <strong>THE COMMON ROOT CAUSE:</strong> Zero mutual agreement record, no clear repayment schedule, leading directly to resentment.
          </p>
        </div>
      </RetroWindow>
    </section>
  );
}

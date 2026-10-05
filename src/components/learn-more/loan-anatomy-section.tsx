"use client";

import { motion } from "framer-motion";
import { FileCheck, Scale, History, ShieldAlert } from "lucide-react";
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

const uspFeatures = [
  {
    icon: Scale,
    title: "BOTH SIDES AGREE",
    tag: "MUTUAL CONSENT",
    description: "A loan never goes live until both of you review and accept the terms. Nobody can claim you owe them money without your agreement.",
    tagColor: "bg-[#2DD4BF] text-black",
    status: "VERIFIED",
  },
  {
    icon: FileCheck,
    title: "ONE CLEAR RECORD",
    tag: "SINGLE SOURCE",
    description: "One clear record shows the principal amount, repayment date, and agreed terms. No more searching through buried chats.",
    tagColor: "bg-[#FFE600] text-black",
    status: "RECORDED",
  },
  {
    icon: History,
    title: "CHANGE THE TERMS TOGETHER",
    tag: "EASY ADJUSTMENTS",
    description: "Need longer to repay? Propose updated terms in seconds with one tap without awkward back-and-forth negotiations.",
    tagColor: "bg-[#2563EB] text-white",
    status: "ACTIVE",
  },
  {
    icon: ShieldAlert,
    title: "KNOW WHEN IT'S DUE",
    tag: "NO AWKWARD REMINDERS",
    description: "The app tracks upcoming milestones and triggers objective reminder alerts so friendships stay intact without uncomfortable conversations.",
    tagColor: "bg-[#F43F5E] text-white",
    status: "SETTLED",
  },
];

export function LoanAnatomySection() {
  return (
    <section className="w-full max-w-6xl mx-auto z-10 font-mono">
      <RetroWindow
        title="THE FLENDLY GUARANTEE"
        colorBar="yellow"
        className="bg-white dark:bg-[var(--card)] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#FFE600]"
        contentClassName="p-6 sm:p-8"
      >
        <div className="mb-6 text-left">
          <span className="inline-block px-3 py-1 bg-[#2DD4BF] text-black border-[2px] border-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] mb-2">
            CORE DIFFERENTIATOR
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-black dark:text-white uppercase tracking-tight">
            Mutual Approval: Clear terms before money is tracked
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed font-sans font-normal">
            Unlike informal chat promises or unverified notes apps, Flendly establishes a clear agreement both friends accept before any money is tracked.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-4"
        >
          {uspFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="border-[2.5px] border-black dark:border-white/50 bg-[#FAF8F5] dark:bg-[var(--muted)] p-5 sm:p-6 shadow-[3px_3px_0_0_#000000] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.2)] flex flex-col justify-between text-left transition-all hover:-translate-y-0.5 rounded-[8px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-0.5 border border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0_0_#000] rounded-[3px] ${feat.tagColor}`}>
                      {feat.tag}
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-500">#{idx + 1}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 border border-black bg-[#FFE600] flex items-center justify-center text-black shadow-[1px_1px_0_0_#000] shrink-0 rounded-[4px]">
                      <Icon className="w-4.5 h-4.5 stroke-[2.5]" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-black dark:text-white">{feat.title}</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 font-sans font-normal">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-3 border-t-[2px] border-black/10 dark:border-white/10 flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-gray-600 dark:text-gray-400 uppercase">STATUS:</span>
                  <span className="font-bold text-[#059669] dark:text-[#2DD4BF] bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 border border-emerald-400 rounded-[2px]">{feat.status}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="audit-guarantee-block mt-5 p-4 border-[2px] border-black bg-[#FFE600]/20 shadow-[3px_3px_0_0_#000000] flex items-center gap-3 text-left rounded-[8px]">
          <span className="font-mono text-xs font-black bg-black text-[#FFE600] px-2 py-0.5 rounded-[3px] shrink-0">AUDIT</span>
          <p className="font-sans text-xs sm:text-sm text-black dark:text-white font-medium">
            <strong className="font-mono font-bold">AUDIT GUARANTEE:</strong> Both friends see the exact same ledger, updated in real time as repayments happen.
          </p>
        </div>
      </RetroWindow>
    </section>
  );
}

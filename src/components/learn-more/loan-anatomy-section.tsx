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
    title: "100% Dual-Sided Mutual Consent",
    tag: "NO ARBITRARY DEBT",
    description: "A loan never goes live until both parties explicitly review, negotiate, and digitally accept terms. Nobody can falsely claim you owe them money.",
    tagColor: "bg-[#2DD4BF] text-black",
  },
  {
    icon: FileCheck,
    title: "Official Digital IOU Record",
    tag: "LEGITIMATE PROOF",
    description: "Generates an immutable contract audit trail with clear principal, agreed interest rate, compounding schedule, and binding closure deadline.",
    tagColor: "bg-[#FFE600] text-black",
  },
  {
    icon: History,
    title: "Interactive Counter-Offers",
    tag: "SMART NEGOTIATIONS",
    description: "Need longer to repay? Suggest a split deadline or adjusted terms with one tap. Zero awkward phone calls or endless WhatsApp negotiations.",
    tagColor: "bg-[#2563EB] text-white",
  },
  {
    icon: ShieldAlert,
    title: "Automatic Due Date Auditing",
    tag: "ZERO GUILT REMINDERS",
    description: "System automatically tracks upcoming milestones and triggers objective reminder alerts without you having to beg your friend for cash.",
    tagColor: "bg-[#F43F5E] text-white",
  },
];

export function LoanAnatomySection() {
  return (
    <section className="w-full max-w-6xl mx-auto z-10 font-mono">
      <RetroWindow
        title="THE FLENDLY USP // DUAL CONSENT ARCHITECTURE"
        subtitle="WHY FLENDLY IS UNIQUE"
        colorBar="yellow"
        className="bg-white dark:bg-[#161821] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#FFE600]"
        contentClassName="p-6 sm:p-8"
      >
        <div className="mb-6 text-left">
          <span className="inline-block px-3 py-1 bg-[#2DD4BF] text-black border-[2px] border-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] mb-2">
            CORE DIFFERENTIATOR
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-black dark:text-white uppercase tracking-tight">
            Mutual Approval: Official Peer Deeds
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed font-sans">
            Unlike informal chat promises or unverified notes apps, Flendly establishes a verified, two-way digital agreement before a single rupee is tracked.
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
                className="border-[2.5px] border-black dark:border-white/50 bg-[#FAF8F5] dark:bg-[#1E212D] p-5 sm:p-6 shadow-[3px_3px_0_0_#000000] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.2)] flex flex-col justify-between text-left transition-all hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-0.5 border border-black font-mono text-[10px] font-black uppercase shadow-[1px_1px_0_0_#000] ${feat.tagColor}`}>
                      {feat.tag}
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-500">#{idx + 1}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 border border-black bg-[#FFE600] flex items-center justify-center text-black shadow-[1px_1px_0_0_#000] shrink-0">
                      <Icon className="w-4.5 h-4.5 stroke-[2.5]" />
                    </div>
                    <h3 className="text-lg font-black text-black dark:text-white">{feat.title}</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 font-sans font-normal">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-3 border-t-[2px] border-black/10 dark:border-white/10 flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-gray-600 dark:text-gray-400 uppercase">STATUS:</span>
                  <span className="font-bold text-[#059669] dark:text-[#2DD4BF] bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 border border-emerald-400">ENFORCED BY PROTOCOL</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-5 p-4 border-[2px] border-black bg-[#FFE600]/20 dark:bg-[#FFF9C4] shadow-[3px_3px_0_0_#000000] flex items-center gap-3 text-left">
          <span className="text-xl">⚡</span>
          <p className="font-mono text-xs sm:text-sm font-bold text-black dark:text-black">
            <strong>OFFICIAL AUDIT GUARANTEE:</strong> Both parties hold identical, cryptographically signed ledger copies that cannot be altered unilaterally.
          </p>
        </div>
      </RetroWindow>
    </section>
  );
}

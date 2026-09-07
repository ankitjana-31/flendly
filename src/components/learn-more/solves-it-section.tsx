"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  hover: { y: -12, transition: { duration: 0.3 } },
};

const solutions = [
  {
    num: "01",
    icon: "📋",
    title: "Mutual Requests (No Awkward Convos)",
    description:
      "Send a clean request with exact amount, due date, and interest (if any). Your mate gets notified. They accept or counter-offer. No guessing games.",
    highlight: "Crystal clear from day one.",
    accentColor: "from-teal-500/30",
    badgeColor: "bg-teal-500/10 text-teal-300",
  },
  {
    num: "02",
    icon: "⚡",
    title: "1-Click Counter-Offers",
    description:
      "They say they can only pay ₹6,000 of the ₹10,000? Counter back in seconds. Lock down terms that work for everyone without 10 rounds of texts.",
    highlight: "Negotiations in real-time.",
    accentColor: "from-blue-500/30",
    badgeColor: "bg-blue-500/10 text-blue-300",
  },
  {
    num: "03",
    icon: "✅",
    title: "Dual-Proof Payment Confirmations",
    description:
      "When they transfer via UPI or hand over cash, both of you log it into Flendly. Once confirmed, the ledger auto-updates. No more 'Did you send it?' texts.",
    highlight: "Transparency locked in.",
    accentColor: "from-purple-500/30",
    badgeColor: "bg-purple-500/10 text-purple-300",
  },
  {
    num: "04",
    icon: "📊",
    title: "Live Shared Ledger",
    description:
      "Both of you see the exact amount owed, repayments logged, and remaining balance. One source of truth. Friendship saved.",
    highlight: "No more 'Wait, how much was it again?'",
    accentColor: "from-emerald-500/30",
    badgeColor: "bg-emerald-500/10 text-emerald-300",
  },
];

export function SolvesItSection() {
  return (
    <section className="relative py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#2DD4BF] text-xs font-bold tracking-widest uppercase mb-3 block">
            The Fix
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-black text-white mb-4">
            How Flendly Crushes The Awkwardness
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
            Four simple features that eliminate every pain point above.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-6 lg:gap-8"
        >
          {solutions.map((solution, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover="hover"
              className={`rounded-2xl border ${solution.accentColor} to-transparent bg-gradient-to-br from-[#111820] to-[#0B0F14] p-8 relative overflow-hidden group`}
            >
              {/* Card number background */}
              <div className="absolute -top-8 -right-8 text-8xl font-black text-white/5 pointer-events-none">
                {solution.num}
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-4xl">{solution.icon}</div>
                  <div className={`${solution.badgeColor} px-3 py-1 rounded-full text-xs font-bold`}>
                    Step {solution.num}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white mb-4 leading-tight">
                  {solution.title}
                </h3>

                <p className="text-[#94A3B8] text-base leading-relaxed mb-6">
                  {solution.description}
                </p>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-sm font-semibold text-white/80">
                    <span className="text-[#2DD4BF]">Result:</span> {solution.highlight}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

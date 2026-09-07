"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
  hover: { y: -8, transition: { duration: 0.2 } },
};

const archetypes = [
  {
    emoji: "🤐",
    name: "The Silent Sufferer",
    behavior: "Lent ₹15,000 for a party. Never mentioned it again. Remembers it every time you hang out.",
    vibe: "Passive aggressive energy",
    borderColor: "from-blue-500/30",
    bgColor: "bg-blue-500/5",
  },
  {
    emoji: "💬",
    name: "The Text Nagger",
    behavior: "Sends reminders every week. Friendship toxified. Still only half-paid after 3 months.",
    vibe: "Constant notifications",
    borderColor: "from-purple-500/30",
    bgColor: "bg-purple-500/5",
  },
  {
    emoji: "🚀",
    name: "The Ghost",
    behavior: "Borrowed ₹8,000. Changed their number. Moved cities. You see them on Instagram thriving.",
    vibe: "Completely vanished",
    borderColor: "from-rose-500/30",
    bgColor: "bg-rose-500/5",
  },
  {
    emoji: "🤝",
    name: "The Over-Promiser",
    behavior: "Swears they'll pay next week. Then next month. Then once they get the bonus. Spoiler: they never do.",
    vibe: "Endless excuses",
    borderColor: "from-orange-500/30",
    bgColor: "bg-orange-500/5",
  },
];

export function LoanAnatomySection() {
  return (
    <section className="relative py-28 overflow-hidden bg-[#111820]/50 border-y border-[#1E2935]">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#2DD4BF] text-xs font-bold tracking-widest uppercase mb-3 block">
            The Friend Squad
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-black text-white">
            The Anatomy of a Forgotten Loan
          </h2>
          <p className="text-[#94A3B8] text-lg mt-4 max-w-2xl mx-auto">
            Ever lend money to a friend? One of these vibes definitely went down.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-6"
        >
          {archetypes.map((archetype, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover="hover"
              className={`rounded-2xl border ${archetype.borderColor} to-transparent bg-gradient-to-br ${archetype.bgColor} p-6 sm:p-8 relative overflow-hidden group cursor-default`}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="text-5xl mb-4">{archetype.emoji}</div>
                <h3 className="text-2xl font-black text-white mb-3">{archetype.name}</h3>

                <p className="text-[#94A3B8] text-base leading-relaxed mb-4">
                  {archetype.behavior}
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                  <span className="text-xs font-semibold text-white/80">The Vibe:</span>
                  <span className="text-xs text-white/60">{archetype.vibe}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl border border-[#1E2935] bg-[#0B0F14]/50 p-8 text-center"
        >
          <p className="text-[#94A3B8] text-lg">
            <strong className="text-white">The Common Thread:</strong> No clear record, no accountability, just awkwardness and lost money.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

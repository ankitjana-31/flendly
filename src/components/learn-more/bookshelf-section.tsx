"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/**
 * BookshelfSection - Cupboard of forgotten money stories
 *
 * Each book represents a real everyday money problem between friends.
 * No emojis - using typography, layout and visual storytelling instead.
 * Stories are based on actual Flendly problems/features.
 */

const BOOKS = [
  {
    id: 1,
    title: "THE ₹500 THAT DISAPPEARED",
    story:
      "You paid for them. They said they'd send it tonight. Tonight became next week. Next week became six months.",
    problem:
      "Small debts become awkward memories. The longer you wait, the harder it is to ask.",
    fix:
      "Flendly keeps the agreement and repayment history clear. No more guessing games.",
  },
  {
    id: 2,
    title: "THE NEXT WEEK",
    story:
      "₹8,000 borrowed. 'Next week pakka.' Next week arrived. Nothing did. Another week passed.",
    problem:
      "Repeated 'next week' promises that never materialize. Friendship slowly toxified.",
    fix:
      "Real-time shared ledger. Both see what's owed. One source of truth.",
  },
  {
    id: 3,
    title: "THE DINNER SPLIT",
    story:
      "'Bro, I'll UPI you.' You remember paying. They remember saying they'll pay. Nobody remembers the amount.",
    problem:
      "Unclear amounts. 'Was it ₹200 or ₹300?' The receipt is gone. The memory fades.",
    fix:
      "Transparent tracking. Exact amounts logged. No more 'how much was it?'",
  },
  {
    id: 4,
    title: "THE PERMANENT DEBT",
    story:
      "Small amounts keep piling up until neither person knows the actual balance anymore. ₹500 here, ₹1,000 there. Months go by.",
    problem:
      "Debt accumulation goes unnoticed. Both parties avoid the topic. Friendship erodes silently.",
    fix:
      "Net position overview. Know exactly what you're owed vs. what you owe.",
  },
  {
    id: 5,
    title: "THE CONCERT COST",
    story:
      "₹3,000 for tickets. 'I'll pay you back when I get my salary.' Salary came. Payment didn't.",
    problem:
      "Personal expenses covered by one person. The other forgets entirely. Resentment builds.",
    fix:
      "Self Track. Private records for your own peace of mind. No notifications to the other person.",
  },
  {
    id: 6,
    title: "THE UPI MISTAKE",
    story:
      "Sent ₹1,200 to the wrong person. 'Next time I'll be more careful.' But next time never comes.",
    problem:
      "Payment errors. No confirmation. No proof. Money gone into the void.",
    fix:
      "Dual-proof payment confirmations. Both log it. Once confirmed, ledger auto-updates.",
  },
];

export function BookshelfSection() {
  return (
    <section
      className="relative py-24 px-6 overflow-hidden bg-[#0B0F14]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Cupboard/Bookshelf visual */}
        <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] bg-[#1E2935]/30 border-t border-teal-500/20 border-b border-teal-500/20 rounded-2xl p-8 md:p-12 overflow-hidden">
          {/* Decorative top beam */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient to-r from-transparent via-teal-500/30 to-transparent" />

          {/* Books grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-8">
            {BOOKS.map((book) => (
              <div
                key={book.id}
                className="group rounded-2xl bg-[#161C22]/80 border border-[#1E2935]/30 p-6 sm:p-8 hover:border-teal-500/20 transition-all duration-300 cursor-default"
              >
                {/* Book title - prominent */}
                <motion.h3
                  className="font-heading text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-teal-400 transition-colors"
                >
                  {book.title}
                </motion.h3>

                {/* Story text */}
                <motion.p
                  className="text-sm sm:text-base text-[#94A3B8] leading-relaxed mb-6 line-clamp-4"
                >
                  {book.story}
                </motion.p>

                {/* Problem tag */}
                <motion.div
                  className="text-xs sm:text-sm font-medium text-teal-400/60 mb-4"
                >
                  {book.problem}
                </motion.div>

                {/* Fix CTA - subtle */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(45,212,191,0.05)",
                  }}
                  className="w-full py-2 rounded-xl border border-teal-500/20 text-[10px] sm:text-sm font-semibold uppercase tracking-wider text-teal-300 hover:bg-teal-500/10 transition-colors cursor-pointer"
                >
                  Learn how Flendly fixes this
                </motion.button>
              </div>
            ))}
          </div>

          {/* Bottom decorative element */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient to-l from-teal-500/20 to-transparent" />
        </div>

        {/* Narrative caption above bookshelf */}
        <div className="absolute -top-6 left-1/2 -translate-x-/2 text-center text-xs sm:text-sm text-teal-400 uppercase tracking-widest">
          "A cupboard full of things we'd rather not talk about."
        </div>
      </div>

      {/* Transitions between sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <p className="text-[#94A3B8] text-sm sm:text-base uppercase tracking-wider">
          Each story is one you've lived. Each fix is one you deserve.
        </p>
      </motion.div>
    </section>
  );
}
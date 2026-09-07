"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
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

const features = [
  {
    icon: "💰",
    title: "Partial Repayment Logs",
    description: "Track repayments bit-by-bit. Balance auto-calculates. No mental math required.",
  },
  {
    icon: "📝",
    title: "Personal Notes",
    description: "Add context for each record. Why did you lend it? When do you expect it back?",
  },
  {
    icon: "🔒",
    title: "100% Private",
    description: "Completely isolated to your account. Your mate has no idea this ledger exists.",
  },
  {
    icon: "⚡",
    title: "Instant Settlement",
    description: "Mark debts as settled with one tap. Clean slate mentality.",
  },
];

export function SelfTrackShowcase() {
  return (
    <section className="relative py-24 bg-[#111820]/70 border-y border-[#1E2935]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left: Content */}
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6"
            >
              🎯 Bonus Feature
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="font-heading text-3xl sm:text-4xl font-black text-white mb-6"
            >
              Self Track: Your Private Money Ledger
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-[#94A3B8] text-base leading-relaxed mb-8"
            >
              Lent ₹500 for chai? Paid ₹3,000 for concert tickets? Covered your roommate's bills? Self Track is your private vault for everything outside official Flendly deals. Zero notifications to them. 100% for you.
            </motion.p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4 mb-8"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="text-2xl shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{feature.title}</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-4 rounded-xl border border-teal-500/20 bg-teal-500/5"
            >
              <p className="text-xs text-teal-200">
                <span className="font-bold">Pro tip:</span> Self Track records never trigger notifications. Your mate has zero idea you're tracking this. It's just for your peace of mind.
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#1E2935] bg-[#0B0F14] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2935]">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Self Track · Dashboard</span>
              <span className="text-xs text-[#94A3B8]">3 Active</span>
            </div>

            {/* Record 1 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="mt-4 rounded-2xl border border-teal-500/30 bg-teal-500/5 p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">Lent</span>
                  <h4 className="font-bold text-white text-sm mt-2">₹5,000 to Ananya</h4>
                  <p className="text-xs text-[#94A3B8]">Trip fuel & tolls</p>
                </div>
                <span className="text-sm font-bold text-teal-400">₹2,000 left</span>
              </div>
              <div className="w-full bg-[#1E2935] h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full w-[60%]" />
              </div>
              <div className="flex justify-between text-[11px] text-[#94A3B8]">
                <span>Paid: ₹3,000 (60%)</span>
                <span className="text-teal-400 font-medium">2 payments logged</span>
              </div>
            </motion.div>

            {/* Record 2 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              viewport={{ once: true }}
              className="mt-3 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">Lent</span>
                  <h4 className="font-bold text-white text-sm mt-2">₹1,200 for tickets</h4>
                  <p className="text-xs text-[#94A3B8]">Concert. They owe me one.</p>
                </div>
                <span className="text-sm font-bold text-blue-400">₹1,200 left</span>
              </div>
              <div className="w-full bg-[#1E2935] h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full w-[0%]" />
              </div>
              <div className="flex justify-between text-[11px] text-[#94A3B8]">
                <span>Pending payment</span>
                <span className="text-blue-400 font-medium">Active</span>
              </div>
            </motion.div>

            {/* Record 3 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">Borrowed</span>
                  <h4 className="font-bold text-white text-sm mt-2">₹3,500 from Siddharth</h4>
                  <p className="text-xs text-[#94A3B8]">Gym annual split</p>
                </div>
                <span className="text-sm font-bold text-rose-400">₹3,500 left</span>
              </div>
              <div className="w-full bg-[#1E2935] h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500 to-red-400 h-full w-[0%]" />
              </div>
              <div className="flex justify-between text-[11px] text-[#94A3B8]">
                <span>Pending settlement</span>
                <span className="text-rose-400 font-medium">Due soon</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              viewport={{ once: true }}
              className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold hover:border-teal-500/50 transition-colors cursor-pointer"
            >
              + Add New Record
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

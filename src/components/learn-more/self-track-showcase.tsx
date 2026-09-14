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

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
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
    title: "Personal Context Notes",
    description: "Add private context for each record. Why did you lend it? When do you expect it back?",
  },
  {
    icon: "🔒",
    title: "100% Private Offline",
    description: "Completely isolated to your device session. Your mate has zero idea this ledger exists.",
  },
  {
    icon: "⚡",
    title: "Instant One-Click Settlement",
    description: "Mark debts as settled with one tap whenever you are paid back. Clean slate.",
  },
];

export function SelfTrackShowcase() {
  return (
    <section className="w-full max-w-6xl mx-auto z-10">
      <RetroWindow
        title="SELF TRACK VAULT // OFFLINE PRIVATE LEDGER"
        subtitle="v2.4"
        colorBar="yellow"
        className="bg-white dark:bg-[#161821] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#FFE600]"
        contentClassName="p-6 sm:p-8 text-left"
        headerRight={
          <span className="px-2 py-0.5 border border-black bg-black text-white font-mono text-[10px] font-bold uppercase">
            PRIVACY MAX
          </span>
        }
      >
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Pitch & Features */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-[#2DD4BF] text-black border-[2px] border-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] mb-2">
                STANDALONE FEATURE
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-black dark:text-white uppercase tracking-tight">
                Self Track: Private Offline Ledger
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg mt-2 leading-relaxed">
                Lent ₹500 for chai? Paid ₹3,000 for concert tickets? Covered your roommate&apos;s Wi-Fi? Self Track is your personal offline record. Zero notifications to anyone. 100% peace of mind.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-3.5 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[2px_2px_0_0_#000000]"
                >
                  <span className="text-xl mb-1 block">{feature.icon}</span>
                  <h3 className="font-mono text-xs sm:text-sm font-bold text-black dark:text-white uppercase">{feature.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Mockup Card */}
          <div className="lg:col-span-6">
            <div className="border-[2.5px] border-black dark:border-white bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[5px_5px_0_0_#000000] dark:shadow-[5px_5px_0_0_#2563EB] p-6">
              <div className="flex items-center justify-between pb-3 border-b-[2px] border-black dark:border-white/30 mb-4 font-mono text-xs">
                <span className="font-bold text-black dark:text-white uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#10B981] border border-black inline-block" />
                  SELF TRACK // REGISTER
                </span>
                <span className="px-2 py-0.5 border border-black bg-[#FFE600] text-black font-bold">3 ACTIVE</span>
              </div>

              {/* Record 1 */}
              <div className="p-4 border-[2px] border-black bg-white dark:bg-[#12141D] shadow-[3px_3px_0_0_#000000] mb-3 space-y-2 font-mono">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 border border-black bg-[#2DD4BF] text-black font-bold uppercase">LENT</span>
                    <h4 className="font-bold text-base text-black dark:text-white mt-1">₹5,000 to Supriya</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">Trip fuel & tolls split</p>
                  </div>
                  <span className="text-base font-bold text-[#059669] dark:text-[#2DD4BF]">₹2,000 left</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 border border-black h-3 overflow-hidden">
                  <div className="bg-[#2DD4BF] h-full" style={{ width: "60%" }} />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 font-bold">
                  <span>Repaid: ₹3,000 (60%)</span>
                  <span className="text-[#059669] dark:text-[#2DD4BF]">2 payments logged</span>
                </div>
              </div>

              {/* Record 2 */}
              <div className="p-4 border-[2px] border-black bg-white dark:bg-[#12141D] shadow-[3px_3px_0_0_#000000] mb-3 space-y-2 font-mono">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 border border-black bg-[#F43F5E] text-white font-bold uppercase">BORROWED</span>
                    <h4 className="font-bold text-base text-black dark:text-white mt-1">₹3,500 from Rahul</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">Gym membership annual share</p>
                  </div>
                  <span className="text-base font-bold text-[#F43F5E]">₹3,500 due</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 border border-black h-3 overflow-hidden">
                  <div className="bg-[#F43F5E] h-full" style={{ width: "0%" }} />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 font-bold">
                  <span>Pending settlement</span>
                  <span className="text-[#F43F5E]">Due this Friday</span>
                </div>
              </div>

              <div className="p-3 bg-[#FFE600]/20 border border-black font-mono text-xs font-bold text-black dark:text-white flex items-center gap-2">
                <span>🔒</span>
                <span>ZERO CLOUD NOTIFICATIONS · ENCRYPTED LOCAL DATA</span>
              </div>
            </div>
          </div>
        </div>
      </RetroWindow>
    </section>
  );
}

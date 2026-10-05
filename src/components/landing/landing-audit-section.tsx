"use client";

import React from "react";

const steps = [
  { num: "01", label: "REQUEST", desc: "Start a lending request.", color: "bg-[#2563EB]", textColor: "text-white" },
  { num: "02", label: "AGREE", desc: "Set the amount and terms together.", color: "bg-[#FF2E93]", textColor: "text-white" },
  { num: "03", label: "RECORD", desc: "Both sides accept and the loan becomes an official record.", color: "bg-[#FFE600]", textColor: "text-black" },
  { num: "04", label: "REPAY", desc: "Track repayments until the loan is settled.", color: "bg-[#10B981]", textColor: "text-black" },
];

export function LandingAuditSection() {
  return (
    <section className="w-full max-w-[1400px] z-20 flex flex-col bg-white dark:bg-[var(--card)] border-[2px] sm:border-[3px] border-black dark:border-white shadow-[4px_4px_0_0_#000000] sm:shadow-[6px_6px_0_0_#000000] dark:shadow-[4px_4px_0_0_#10B981] transition-colors rounded-[12px] overflow-hidden">
      {/* Titlebar */}
      <div className="h-9 sm:h-10 bg-[#10B981] text-black px-3.5 sm:px-6 border-b-[2px] sm:border-b-[3px] border-black dark:border-white flex items-center justify-between select-none">
        <div className="flex items-center gap-2 font-mono text-[11px] sm:text-sm uppercase font-black tracking-wider">
          <span>HOW FLENDLY WORKS</span>
        </div>
        <span className="landing-comparison-badge px-2 py-0.5 bg-white text-black border border-black font-mono text-[9px] sm:text-[10px] font-black hidden sm:inline shadow-[1px_1px_0_0_#000] rounded-[2px]">
          4 STEPS
        </span>
      </div>

      <div className="p-4 sm:p-6 md:p-8 lg:p-10">
        {/* Section headline */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white tracking-tight uppercase">
            Make the deal clear. Then keep track of it.
          </h2>
        </div>

        {/* 4-Step Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {steps.map((step) => (
            <div key={step.num} className="relative flex flex-col items-center text-center group">
              {/* Step Badge */}
              <div className={`w-full ${step.color} ${step.textColor} border-[2px] border-black shadow-[3px_3px_0_0_#000] rounded-[8px] p-3.5 sm:p-4 flex flex-col items-center gap-1.5 transition-transform group-hover:-translate-y-1`}>
                <span className="font-mono text-[10px] font-bold opacity-75 uppercase">{step.num} //</span>
                <span className="font-mono text-sm sm:text-base font-black tracking-wider">{step.label}</span>
              </div>
              {/* Description */}
              <p className="mt-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-sans font-medium leading-snug px-1">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="mt-6 sm:mt-8 bg-[#FAF8F5] dark:bg-[var(--muted)] border-[2px] border-black shadow-[3px_3px_0_0_#000] rounded-[8px] p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-display text-xs sm:text-sm font-bold text-black dark:text-white uppercase tracking-tight">
            Not a split tracker. A money-between-friends tracker.
          </span>
          <span className="font-mono text-[10px] sm:text-xs font-bold text-[#10B981] dark:text-[#2DD4BF] uppercase">
            Zero awkward conversations
          </span>
        </div>
      </div>
    </section>
  );
}

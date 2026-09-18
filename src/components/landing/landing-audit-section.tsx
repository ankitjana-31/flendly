"use client";

import React from "react";

export function LandingAuditSection() {
  return (
    <section className="w-full max-w-[1400px] z-20 flex flex-col bg-white dark:bg-[var(--card)] border-[3px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#10B981] transition-colors rounded-sm overflow-hidden">
      {/* Titlebar */}
      <div className="h-10 bg-[#10B981] text-black px-4 sm:px-6 border-b-[3px] border-black dark:border-white flex items-center justify-between select-none">
        <div className="flex items-center gap-2 font-mono text-xs sm:text-sm uppercase font-black tracking-wider">
          <span>⇄</span>
          <span>SYSTEM AUDIT: OLD HABITS vs FLENDLY STANDARD</span>
        </div>
        <span className="px-2 py-0.5 bg-white text-black border border-black font-mono text-[10px] font-black hidden sm:inline shadow-[1px_1px_0_0_#000]">
          COMPARISON VIEW
        </span>
      </div>

      {/* Spacious 2-Column Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y-[3px] md:divide-y-0 md:divide-x-[3px] divide-black dark:divide-white">
        {/* Left Column: The WhatsApp Mess */}
        <div className="p-6 md:p-10 bg-[#FAF8F5] dark:bg-[var(--muted)] flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="bg-[#FF2E93]/15 text-[#F43F5E] px-3 py-1 border-[2px] border-black dark:border-white font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000]">
              OLD METHOD: WHATSAPP MESS
            </span>
          </div>
          <p className="font-sans text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Lost receipts, forgotten cab rides, awkward follow-up texts, and unnecessary tension between friends.
          </p>
          <div className="flex flex-col gap-3 font-mono">
            <div className="bg-white dark:bg-[#242938] border-[2px] border-black dark:border-white/40 p-3.5 shadow-[2px_2px_0_0_#000000]">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1 font-bold">Ankit • 14 Feb</div>
              <div className="text-sm font-semibold text-black dark:text-white italic">&quot;Hey bro, did you get a chance to send the Airbnb share?&quot;</div>
            </div>
            <div className="bg-white dark:bg-[#242938] border-[2px] border-black dark:border-white/40 p-3.5 shadow-[2px_2px_0_0_#000000]">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1 font-bold">Rahul (4 days later)</div>
              <div className="text-sm font-semibold text-black dark:text-white italic">&quot;Totally missed this! How much was it again?&quot;</div>
            </div>
            <div className="bg-white dark:bg-[#242938] border-[2px] border-black dark:border-white/40 p-3.5 shadow-[2px_2px_0_0_#000000]">
              <div className="text-sm font-black text-[#F43F5E]">&quot;₹1,450... whenever you get a second 🙏&quot;</div>
            </div>
          </div>
          <div className="mt-auto p-3 bg-[#FF2E93]/15 border-[2px] border-black dark:border-white font-mono text-xs flex items-center justify-between shadow-[2px_2px_0_0_#000]">
            <span className="font-bold text-black dark:text-white">Unrecovered IOUs:</span>
            <span className="font-mono text-sm text-[#F43F5E] font-black">₹4,200 / year avg</span>
          </div>
        </div>

        {/* Right Column: The Flendly Ledger (Matching Left Side Airbnb Split) */}
        <div className="p-6 md:p-10 bg-white dark:bg-[var(--card)] flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="bg-[#2DD4BF] text-black px-3 py-1 border-[2px] border-black dark:border-white font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000]">
              FLENDLY DEAL: 100% CRYSTAL
            </span>
          </div>
          <p className="font-sans text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Every split expense, trip booking, or borrowed cash is structured with mutual approval and clear closure dates.
          </p>
          <div className="flex flex-col gap-3">
            {/* Matching Airbnb Split for Rahul */}
            <div className="bg-[#FAF8F5] dark:bg-[#242938] border-[2px] border-black dark:border-white/40 p-3.5 shadow-[2px_2px_0_0_#000000] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#2563EB] text-white border border-black dark:border-white flex items-center justify-center font-bold text-xs font-mono">RH</div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-black dark:text-white uppercase">Airbnb Split (Rahul)</span>
                  <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">Dual-Signed • Auto-UPI</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm sm:text-base text-[#10B981] font-bold block">₹1,450.00</span>
                <span className="font-mono text-[10px] bg-[#2DD4BF] text-black px-1.5 py-0.5 border border-black font-bold uppercase">SETTLED</span>
              </div>
            </div>

            {/* Concert Advance for Kunal */}
            <div className="bg-[#FAF8F5] dark:bg-[#242938] border-[2px] border-black dark:border-white/40 p-3.5 shadow-[2px_2px_0_0_#000000] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#F43F5E] text-white border border-black dark:border-white flex items-center justify-center font-bold text-xs font-mono">KN</div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-black dark:text-white uppercase">Concert Advance (Kunal)</span>
                  <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">Scheduled: 2-Part Tranche</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm sm:text-base text-[#2563EB] dark:text-[#60A5FA] font-bold block">₹3,000.00</span>
                <span className="font-mono text-[10px] bg-[#FFE600] text-black px-1.5 py-0.5 border border-black font-bold uppercase">SCHEDULED</span>
              </div>
            </div>
          </div>
          <div className="mt-auto p-3 bg-[#2DD4BF] text-black border-[2px] border-black font-mono text-xs flex items-center justify-between shadow-[2px_2px_0_0_#000]">
            <span className="font-bold">Awkward Conversations:</span>
            <span className="font-mono text-sm font-black">0.00 SECONDS</span>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";

export function LandingAuditSection() {

  return (
    <section className="w-full max-w-[1400px] z-20 flex flex-col bg-white dark:bg-[var(--card)] border-[2px] sm:border-[3px] border-black dark:border-white shadow-[4px_4px_0_0_#000000] sm:shadow-[6px_6px_0_0_#000000] dark:shadow-[4px_4px_0_0_#10B981] transition-colors rounded-[8px] overflow-hidden">
      {/* Titlebar */}
      <div className="h-9 sm:h-10 bg-[#10B981] text-black px-3.5 sm:px-6 border-b-[2px] sm:border-b-[3px] border-black dark:border-white flex items-center justify-between select-none">
        <div className="flex items-center gap-2 font-mono text-[11px] sm:text-sm uppercase font-black tracking-wider">
          <span>⇄</span>
          <span>OLD HABITS vs FLENDLY</span>
        </div>
        <span className="px-2 py-0.5 bg-white text-black border border-black font-mono text-[9px] sm:text-[10px] font-black hidden sm:inline shadow-[1px_1px_0_0_#000] rounded-[2px]">
          COMPARISON
        </span>
      </div>

      {/* Spacious 2-Column Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y-[2px] md:divide-y-0 md:divide-x-[3px] divide-black dark:divide-white">
        {/* Left Column: The WhatsApp Mess */}
        <div className="p-4 sm:p-6 md:p-10 bg-[#FAF8F5] dark:bg-[var(--muted)] flex flex-col gap-3.5 sm:gap-6">
          <div className="flex items-center justify-between">
            <span className="bg-[#FF2E93]/15 text-[#F43F5E] px-2.5 py-0.5 sm:px-3 sm:py-1 border-[1.5px] sm:border-[2px] border-black dark:border-white font-mono text-[11px] sm:text-xs font-bold uppercase shadow-[1.5px_1.5px_0_0_#000] rounded-[4px]">
              OLD: WHATSAPP CHAT MESS
            </span>
          </div>
          <p className="font-sans text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Lost receipts, forgotten cab rides, awkward follow-up texts, and unnecessary tension between friends.
          </p>
          <div className="flex flex-col gap-2 sm:gap-3 font-mono">
            <div className="bg-white dark:bg-[#242938] border-[1.5px] sm:border-[2px] border-black dark:border-white/40 p-2.5 sm:p-3.5 shadow-[2px_2px_0_0_#000000] rounded-[6px]">
              <div className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs mb-0.5 font-bold">Ankit • 14 Feb</div>
              <div className="text-xs sm:text-sm font-semibold text-black dark:text-white italic">&quot;Hey bro, did you get a chance to send the Airbnb share?&quot;</div>
            </div>
            <div className="hidden sm:block bg-white dark:bg-[#242938] border-[1.5px] sm:border-[2px] border-black dark:border-white/40 p-2.5 sm:p-3.5 shadow-[2px_2px_0_0_#000000] rounded-[6px]">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-0.5 font-bold">Rahul (4 days later)</div>
              <div className="text-sm font-semibold text-black dark:text-white italic">&quot;Totally missed this! How much was it again?&quot;</div>
            </div>
            <div className="bg-white dark:bg-[#242938] border-[1.5px] sm:border-[2px] border-black dark:border-white/40 p-2.5 sm:p-3.5 shadow-[2px_2px_0_0_#000000] rounded-[6px]">
              <div className="text-xs sm:text-sm font-black text-[#F43F5E]">&quot;₹1,450... whenever you get a second 🙏&quot;</div>
            </div>
          </div>
          <div className="mt-auto p-2.5 sm:p-3 bg-[#FF2E93]/15 border-[1.5px] sm:border-[2px] border-black dark:border-white font-mono text-xs flex items-center justify-between shadow-[2px_2px_0_0_#000] rounded-[6px]">
            <span className="font-bold text-black dark:text-white text-[11px] sm:text-xs">Unrecovered IOUs:</span>
            <span className="font-mono text-xs sm:text-sm text-[#F43F5E] font-black">₹4,200 / yr avg</span>
          </div>
        </div>

        {/* Right Column: The Flendly Ledger */}
        <div className="p-4 sm:p-6 md:p-10 bg-white dark:bg-[var(--card)] flex flex-col gap-3.5 sm:gap-6">
          <div className="flex items-center justify-between">
            <span className="bg-[#2DD4BF] text-black px-2.5 py-0.5 sm:px-3 sm:py-1 border-[1.5px] sm:border-[2px] border-black dark:border-white font-mono text-[11px] sm:text-xs font-bold uppercase shadow-[1.5px_1.5px_0_0_#000] rounded-[4px]">
              FLENDLY: 100% CRYSTAL
            </span>
          </div>
          <p className="font-sans text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Every split expense, trip booking, or borrowed cash is structured with mutual approval and clear closure dates.
          </p>
          <div className="flex flex-col gap-2 sm:gap-3">
            {/* Matching Airbnb Split for Rahul */}
            <div className="bg-[#FAF8F5] dark:bg-[#242938] border-[1.5px] sm:border-[2px] border-black dark:border-white/40 p-2.5 sm:p-3.5 shadow-[2px_2px_0_0_#000000] flex items-center justify-between rounded-[6px]">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] bg-[#2563EB] text-white border border-black dark:border-white flex items-center justify-center font-bold text-xs font-mono">RH</div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-black dark:text-white uppercase truncate">Airbnb Split</span>
                  <span className="font-mono text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400">Mutual Agreement</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs sm:text-base text-[#10B981] font-bold block">₹1,450.00</span>
                <span className="font-mono text-[9px] sm:text-[10px] rounded-[2px] bg-[#2DD4BF] text-black px-1.5 py-0.5 border border-black font-bold uppercase">SETTLED</span>
              </div>
            </div>

            {/* Concert Advance for Kunal */}
            <div className="bg-[#FAF8F5] dark:bg-[#242938] border-[1.5px] sm:border-[2px] border-black dark:border-white/40 p-2.5 sm:p-3.5 shadow-[2px_2px_0_0_#000000] flex items-center justify-between rounded-[6px]">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] bg-[#F43F5E] text-white border border-black dark:border-white flex items-center justify-center font-bold text-xs font-mono">KN</div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-black dark:text-white uppercase truncate">Concert Advance</span>
                  <span className="font-mono text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400">Fixed Due Date</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs sm:text-base text-[#2563EB] dark:text-[#60A5FA] font-bold block">₹3,000.00</span>
                <span className="font-mono text-[9px] sm:text-[10px] rounded-[2px] bg-[#FFE600] text-black px-1.5 py-0.5 border border-black font-bold uppercase">SCHEDULED</span>
              </div>
            </div>
          </div>
          <div className="mt-auto p-2.5 sm:p-3 bg-[#2DD4BF] text-black border-[1.5px] sm:border-[2px] border-black font-mono text-xs flex items-center justify-between shadow-[2px_2px_0_0_#000] rounded-[6px]">
            <span className="font-bold text-[11px] sm:text-xs">Awkward Conversations:</span>
            <span className="font-mono text-xs sm:text-sm font-black">0 SECONDS</span>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Sparkles, Shield, DollarSign } from "lucide-react";

export function LenderSection() {
  const [amount, setAmount] = useState(250000);
  const [tenureMonths, setTenureMonths] = useState(12);
  const [interestRate, setInterestRate] = useState(12.5);

  const projectedEarnings = Math.round((amount * (interestRate / 100) * (tenureMonths / 12)));
  const totalRepayment = amount + projectedEarnings;

  return (
    <section id="lenders" className="relative bg-[#0B0F14] py-32 px-6 sm:px-8 border-t border-slate-800/60">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 uppercase tracking-widest">
              Lender Portal
            </div>

            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white leading-tight">
              Turn idle money into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">
                predictable yield.
              </span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              Traditional savings accounts lose value to inflation. Lend directly to trusted
              peers with verified terms, custom interest rates, and automated repayment tracking.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="rounded-2xl border border-slate-800 bg-[#101820] p-5">
                <p className="text-2xl font-bold text-teal-400">8.0% – 18.0%</p>
                <p className="mt-1 text-xs text-slate-400">Custom Agreed Yields</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#101820] p-5">
                <p className="text-2xl font-bold text-cyan-400">Direct P2P</p>
                <p className="mt-1 text-xs text-slate-400">Zero Middleman Spread</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/auth/login"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-teal-400 px-7 text-sm font-bold text-[#0B0F14] transition-all hover:bg-teal-300 hover:shadow-lg hover:shadow-teal-400/25"
              >
                <span>Start Lending Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Interactive Yield Simulator Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-teal-500/30 bg-[#111A22]/90 p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Yield Calculator</h3>
                  <p className="text-xs text-slate-400">Simulate your returns based on agreed terms</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {/* Capital Slider */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-2">
                    <span>Investment Amount</span>
                    <span className="font-mono font-bold text-teal-400">
                      ₹{amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={1000000}
                    step={10000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Tenure Selector */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-2">
                    <span>Loan Duration</span>
                    <span className="font-mono font-bold text-cyan-400">{tenureMonths} Months</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 6, 12, 24].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTenureMonths(m)}
                        className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                          tenureMonths === m
                            ? "bg-teal-400/20 border-teal-400 text-teal-300"
                            : "bg-[#101820] border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {m} Mo
                      </button>
                    ))}
                  </div>
                </div>

                {/* Return Output Box */}
                <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Projected Earnings ({interestRate}%)</p>
                      <p className="mt-1 text-2xl font-black text-teal-400 font-mono">
                        +₹{projectedEarnings.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total Payout</p>
                      <p className="mt-1 text-lg font-bold text-white font-mono">
                        ₹{totalRepayment.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import React from "react";
import { Users, ArrowUpRight, Zap, Network, Globe } from "lucide-react";
import Link from "next/link";

export function NetworkSection() {
  const liveStats = [
    { label: "Active P2P Volume", value: "₹12.8M+", change: "+28% MoM" },
    { label: "Average Settlement Time", value: "< 24 Hrs", change: "Fastest in P2P" },
    { label: "Verified Ledgers", value: "4,200+", change: "Zero Data Tampering" },
    { label: "On-Time Repayment Rate", value: "98.6%", change: "Highest Trust Score" },
  ];

  return (
    <section id="network" className="relative bg-[#0B0F14] py-32 px-6 sm:px-8 border-t border-slate-800/60 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-teal-500/5 blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-7xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 uppercase tracking-widest">
          <Network className="h-3.5 w-3.5 text-blue-400" />
          <span>Decentralized Liquidity Mesh</span>
        </div>

        <h2 className="mt-4 font-heading text-4xl sm:text-6xl font-bold text-white tracking-tight">
          A growing network of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">
            trusted peer agreements.
          </span>
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 leading-relaxed">
          Every loan on Flendly isn’t an isolated agreement — it connects into a growing web
          of transparent, verifiable credit histories.
        </p>

        {/* Live Network Metrics */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {liveStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-slate-800/80 bg-[#101820]/80 p-8 shadow-xl backdrop-blur-xl transition-all hover:border-teal-500/40 hover:bg-[#111A22]"
            >
              <p className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-300">{stat.label}</p>
              <span className="mt-3 inline-block rounded-full bg-teal-400/10 px-2.5 py-0.5 text-[10px] font-bold text-teal-300">
                {stat.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
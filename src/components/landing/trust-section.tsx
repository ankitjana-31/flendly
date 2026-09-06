"use client";

import React from "react";
import { ShieldCheck, Eye, Lock, FileSpreadsheet, Check } from "lucide-react";

export function TrustSection() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "100% Verified Identities",
      desc: "Every lender and borrower undergoes identity verification before initiating a loan request. No anonymous transactions.",
      tag: "Verification",
    },
    {
      icon: Eye,
      title: "Zero Hidden Margins",
      desc: "Banks keep up to 80% of interest spread. On Flendly, agreed rates go straight to the lender with zero hidden intermediary fees.",
      tag: "Fair Rates",
    },
    {
      icon: Lock,
      title: "Cryptographically Verified",
      desc: "Every loan creation, approval, and repayment event generates an immutable record stored securely on Supabase row-level security.",
      tag: "Security",
    },
    {
      icon: FileSpreadsheet,
      title: "Shared Single Source of Truth",
      desc: "No more messy WhatsApp screenshots or forgotten promises. Both parties see the exact same balance, schedule, and history.",
      tag: "Transparency",
    },
  ];

  return (
    <section id="trust" className="relative bg-[#0B0F14] py-32 px-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[700px] rounded-full bg-teal-500/5 blur-[120px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Editorial Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 uppercase tracking-widest">
              Institutional Grade Trust
            </div>

            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white leading-tight">
              Built around <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                absolute transparency.
              </span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              We replaced ambiguous promises and bank complexity with clear, mutual agreements.
              Both lender and borrower know exactly when, how, and what is due.
            </p>

            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              {[
                "Direct peer-to-peer agreement contracts",
                "Automated reminders & deadline schedules",
                "Privacy settings: you choose who sees your contact info",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-400/10 text-teal-400">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Trust Pillar Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-3xl border border-slate-800 bg-[#101820]/90 p-7 shadow-xl backdrop-blur-xl transition-all hover:border-teal-500/40 hover:bg-[#111A22]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-white">{pillar.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
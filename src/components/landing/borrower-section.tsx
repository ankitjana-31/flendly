"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Clock, ShieldCheck, HeartHandshake } from "lucide-react";

export function BorrowerSection() {
  const benefits = [
    {
      title: "No Predatory Compound Fees",
      desc: "Fixed, transparent terms agreed upon upfront with your counterparty. No surprise penalties or hidden interest compounding.",
    },
    {
      title: "Flexible Tenures & Milestones",
      desc: "Structure monthly installments, bullet repayments, or custom schedules tailored to your business or personal cash flows.",
    },
    {
      title: "Automated Payment Proofs",
      desc: "Mark repayments with payment notes or UPI/transaction references for instant bilateral reconciliation.",
    },
  ];

  return (
    <section id="borrowers" className="relative bg-[#0B0F14] py-32 px-6 sm:px-8 border-t border-slate-800/60">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Cards Feature Showcase */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl border border-cyan-500/30 bg-[#101820]/90 p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Borrower Experience</h3>
                  <p className="text-xs text-slate-400">Respectful agreements between peers</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {benefits.map((b) => (
                  <div key={b.title} className="flex gap-4 rounded-2xl border border-slate-800 bg-[#111A22] p-4">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{b.title}</h4>
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 uppercase tracking-widest">
              Borrower Portal
            </div>

            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white leading-tight">
              Access funding <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
                without the friction.
              </span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              Whether you are funding project inventory, educational needs, or bridging cash
              flow, Flendly lets you initiate a clear borrowing proposal in minutes.
            </p>

            <div className="pt-4">
              <Link
                href="/auth/login"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-cyan-400 px-7 text-sm font-bold text-[#0B0F14] transition-all hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-400/25"
              >
                <span>Request Funding</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
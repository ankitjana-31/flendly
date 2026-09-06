"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="relative bg-[#0B0F14] py-32 px-6 sm:px-8 border-t border-slate-800/60 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 uppercase tracking-widest mb-6">
          <Sparkles className="h-3.5 w-3.5 text-teal-400" />
          <span>Start Your First Ledger</span>
        </div>

        <h2 className="font-heading text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
          Ready to make money <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">
            move smarter?
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-slate-300 leading-relaxed">
          Create an account in under 60 seconds with Google Sign-In. Zero paperwork, zero hidden
          margins, total peace of mind.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/login"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-teal-400 px-9 text-sm font-bold text-[#0B0F14] shadow-xl shadow-teal-500/20 transition-all hover:bg-teal-300 hover:shadow-teal-400/30"
          >
            <span>Start Lending Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/auth/login"
            className="inline-flex h-13 items-center justify-center rounded-xl border border-slate-700 bg-[#101820]/80 px-8 text-sm font-semibold text-slate-200 backdrop-blur-md transition-all hover:border-slate-500 hover:text-white"
          >
            Explore Borrowing
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Row-Level Security & Cryptographic Audit Trails Enabled</span>
        </div>
      </div>
    </section>
  );
}
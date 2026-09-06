"use client";

import React from "react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070A0E] py-16 px-6 sm:px-8 text-slate-400">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-400 font-brand text-sm font-black text-[#0B0F14]">
            F
          </div>
          <span className="font-brand text-lg font-bold text-white tracking-tight">
            FLENDLY
          </span>
          <span className="text-xs text-slate-500">
            · Transparent P2P Financial Ledger
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <a href="#how-it-works" className="hover:text-teal-400 transition-colors">
            How It Works
          </a>
          <a href="#lenders" className="hover:text-teal-400 transition-colors">
            For Lenders
          </a>
          <a href="#borrowers" className="hover:text-teal-400 transition-colors">
            For Borrowers
          </a>
          <a href="#network" className="hover:text-teal-400 transition-colors">
            Network
          </a>
          <Link href="/auth/login" className="hover:text-teal-400 transition-colors">
            Sign In
          </Link>
        </div>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Flendly Protocol. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
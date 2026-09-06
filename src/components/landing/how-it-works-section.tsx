"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Send, LineChart, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      title: "Discover an Opportunity",
      desc: "Lenders browse verified borrowing requests with complete risk scores, purpose of funds, and proposed interest rates.",
      icon: Search,
      metric: "Verified Requests",
      detail: "100% Identity Checked",
      badgeColor: "text-teal-400 border-teal-500/30 bg-teal-500/10",
    },
    {
      num: "02",
      title: "Fund & Form the Agreement",
      desc: "Commit funds directly to the borrower through an immutable ledger entry. Both parties sign off with clear repayment milestones.",
      icon: Send,
      metric: "Instant Handshake",
      detail: "Zero Intermediary Cut",
      badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    },
    {
      num: "03",
      title: "Track on Shared Ledger",
      desc: "Live amortization tracking with automated payment schedules, deadline reminders, and transparent balance updates.",
      icon: LineChart,
      metric: "Real-Time Ledger",
      detail: "Synchronized for Both Sides",
      badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    },
    {
      num: "04",
      title: "Receive Repayments",
      desc: "Principal and interest payments return directly to the lender. Verified payments automatically update status and credit history.",
      icon: CheckCircle2,
      metric: "Direct Settlement",
      detail: "Automated Proof-of-Payment",
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
  ];

  return (
    <section id="how-it-works" className="relative bg-[#0B0F14] py-32 px-6 sm:px-8 border-t border-slate-800/60">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 uppercase tracking-widest">
            The P2P Lifecycle
          </div>
          <h2 className="mt-4 font-heading text-4xl sm:text-5xl font-bold text-white tracking-tight">
            How peer-to-peer lending <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              actually works.
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-400 leading-relaxed">
            Eliminate traditional banking bureaucracy. Every step from agreement to full
            repayment is clear, transparent, and direct.
          </p>
        </div>

        {/* Interactive 4-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;

            return (
              <motion.div
                key={step.num}
                onClick={() => setActiveStep(idx)}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`cursor-pointer rounded-3xl border p-8 transition-all relative overflow-hidden ${
                  isSelected
                    ? "border-teal-400/50 bg-[#111A22] shadow-2xl shadow-teal-500/15"
                    : "border-slate-800/80 bg-[#101820]/70 hover:border-slate-700"
                }`}
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-slate-600">
                    {step.num}
                  </span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${step.badgeColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-400">
                  {step.desc}
                </p>

                {/* Metric Footer */}
                <div className="mt-8 border-t border-slate-800/80 pt-4">
                  <p className="font-mono text-xs font-semibold text-slate-200">
                    {step.metric}
                  </p>
                  <p className="text-[11px] text-teal-400/80">{step.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Footer */}
        <div className="mt-16 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-400 transition-colors hover:text-teal-300"
          >
            <span>Experience the agreement workflow</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
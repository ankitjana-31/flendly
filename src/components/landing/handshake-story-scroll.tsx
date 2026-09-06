"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Lock,
  Sparkles,
  Users,
  Coins,
} from "lucide-react";
import { ThreeHandshakeCanvas } from "@/components/landing/three-handshake-canvas";

export function HandshakeStoryScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrollProgress(latest);
    });

    const handlePointerMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });

    return () => {
      unsubscribe();
      window.removeEventListener("mousemove", handlePointerMove);
    };
  }, [scrollYProgress]);

  // Stage flags based on normalized progress
  const stage =
    scrollProgress < 0.16
      ? 1
      : scrollProgress < 0.32
      ? 2
      : scrollProgress < 0.48
      ? 3
      : scrollProgress < 0.60
      ? 4
      : scrollProgress < 0.72
      ? 5
      : scrollProgress < 0.85
      ? 6
      : 7;

  return (
    <div id="story" ref={containerRef} className="relative h-[480vh] bg-[#0B0F14]">
      {/* 3D WebGL Background Canvas */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <ThreeHandshakeCanvas
          scrollProgress={scrollProgress}
          mousePos={mousePos}
        />

        {/* Ambient Top & Bottom Vignettes */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-[#0B0F14]/70" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-teal-500/10 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />

        {/* Progress Narrative Timeline (Fixed on Right) */}
        <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-30 flex-col gap-4">
          {[
            { num: "01", label: "Separation" },
            { num: "02", label: "Opportunity" },
            { num: "03", label: "Verification" },
            { num: "04", label: "Agreement" },
            { num: "05", label: "Handshake" },
            { num: "06", label: "Capital Flow" },
            { num: "07", label: "Network" },
          ].map((item, idx) => {
            const isActive = stage === idx + 1;
            return (
              <div key={item.num} className="group flex items-center justify-end gap-3 cursor-pointer">
                <span
                  className={`text-[11px] font-mono transition-colors ${
                    isActive ? "text-teal-400 font-bold" : "text-slate-600"
                  }`}
                >
                  {item.label}
                </span>
                <div
                  className={`h-2 rounded-full transition-all ${
                    isActive
                      ? "w-7 bg-teal-400 shadow-md shadow-teal-400/50"
                      : "w-2 bg-slate-700"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Floating Side Indicators for Lender & Borrower */}
        <div className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden md:block">
          <div className="rounded-2xl border border-white/10 bg-[#111820]/70 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-teal-300">
                Lender Node
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Supplying Capital</p>
          </div>
        </div>

        <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:block lg:right-24">
          <div className="rounded-2xl border border-white/10 bg-[#111820]/70 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-300">
                Borrower Node
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Seeking Growth</p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NARRATIVE STAGE OVERLAYS */}
        {/* ======================================================== */}
        <div className="relative z-20 flex h-full w-full items-center justify-center px-6">
          {/* STAGE 1: HERO VIEWPORT (0.00 - 0.16) */}
          <AnimatePresence>
            {stage === 1 && (
              <motion.div
                key="stage-1"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mx-auto max-w-4xl text-center"
              >
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold tracking-wider text-teal-300 uppercase">
                    Next-Gen P2P Lending Protocol
                  </span>
                </div>

                <h1 className="font-heading text-5xl sm:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                  Where trust <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">
                    becomes capital.
                  </span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
                  Connect with verified borrowers, access transparent lending opportunities,
                  and make every personal financial agreement cryptographically clear.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/auth/login"
                    className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-teal-400 px-8 text-sm font-bold text-[#0B0F14] transition-all hover:bg-teal-300 hover:shadow-xl hover:shadow-teal-400/25"
                  >
                    <span>Start Lending</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/auth/login"
                    className="inline-flex h-13 items-center justify-center rounded-xl border border-slate-700/80 bg-[#111820]/60 px-8 text-sm font-semibold text-slate-200 backdrop-blur-md transition-all hover:border-slate-500 hover:text-white"
                  >
                    Borrow Money
                  </Link>
                </div>

                <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="animate-bounce">↓</span>
                  <span>Scroll to explore the handshake story</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STAGE 2: OPPORTUNITY (0.16 - 0.32) */}
          <AnimatePresence>
            {stage === 2 && (
              <motion.div
                key="stage-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-5xl"
              >
                <div className="text-center mb-8">
                  <span className="font-mono text-xs uppercase tracking-widest text-teal-400">
                    Stage 02 · Opportunity Discovery
                  </span>
                  <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">
                    Capital meets real demand.
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
                  {/* Lender Opportunity Card */}
                  <div className="rounded-3xl border border-teal-500/30 bg-[#101820]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                        Lender Offering
                      </span>
                      <TrendingUp className="h-5 w-5 text-teal-400" />
                    </div>
                    <p className="mt-4 text-3xl font-extrabold text-white">₹2,00,000</p>
                    <p className="text-sm text-slate-300">Available to allocate</p>
                    <div className="mt-6 flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800 pt-4">
                      <span>Target: +12.4% Yield</span>
                      <span>·</span>
                      <span>12 Months Tenure</span>
                    </div>
                  </div>

                  {/* Borrower Request Card */}
                  <div className="rounded-3xl border border-cyan-500/30 bg-[#101820]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                        Borrower Request
                      </span>
                      <Coins className="h-5 w-5 text-cyan-400" />
                    </div>
                    <p className="mt-4 text-3xl font-extrabold text-white">₹1,50,000</p>
                    <p className="text-sm text-slate-300">Verified Business Expansion</p>
                    <div className="mt-6 flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800 pt-4">
                      <span>Zero Hidden Fees</span>
                      <span>·</span>
                      <span>Monthly Repayments</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STAGE 3: HOLOGRAPHIC VERIFICATION (0.32 - 0.48) */}
          <AnimatePresence>
            {stage === 3 && (
              <motion.div
                key="stage-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mx-auto max-w-md text-center"
              >
                <div className="rounded-3xl border border-teal-500/40 bg-[#0B0F14]/90 p-8 shadow-2xl shadow-teal-500/20 backdrop-blur-2xl">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Trust Layer Verified</h3>
                  <p className="mt-1 text-xs text-slate-300">
                    Both parties are vetted before any agreement is formed.
                  </p>

                  <div className="mt-6 space-y-3 text-left">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#111A22]/80 p-3 text-xs text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                      <span>Identity & Government ID verified</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#111A22]/80 p-3 text-xs text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                      <span>Creditworthiness & Repayment capacity audited</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#111A22]/80 p-3 text-xs text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                      <span>Transparent mutually agreed interest rate</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STAGE 4: AGREEMENT (0.48 - 0.60) */}
          <AnimatePresence>
            {stage === 4 && (
              <motion.div
                key="stage-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="mx-auto max-w-lg text-center"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-teal-400">
                  Stage 04 · Agreement
                </span>
                <h2 className="mt-2 text-3xl sm:text-5xl font-bold text-white leading-tight">
                  Two sides align.
                </h2>
                <p className="mt-4 text-base text-slate-300">
                  No predatory interest. No banking overhead. The hands prepare to lock in a
                  fair, transparent personal contract.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STAGE 5: THE HANDSHAKE (0.60 - 0.72) */}
          <AnimatePresence>
            {stage === 5 && (
              <motion.div
                key="stage-5"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="mx-auto max-w-xl text-center"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300">
                  <Lock className="h-3.5 w-3.5" />
                  <span>On-Ledger Agreement Sealed</span>
                </div>
                <h2 className="mt-4 text-4xl sm:text-6xl font-black text-white">
                  The Handshake.
                </h2>
                <p className="mt-3 text-base text-slate-300">
                  Trust is established. A transparent peer-to-peer contract is created with
                  immutable transaction records.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STAGE 6: CAPITAL FLOW (0.72 - 0.85) */}
          <AnimatePresence>
            {stage === 6 && (
              <motion.div
                key="stage-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-4xl"
              >
                <div className="text-center mb-8">
                  <span className="font-mono text-xs uppercase tracking-widest text-teal-400">
                    Stage 06 · Value Movement
                  </span>
                  <h2 className="mt-2 text-3xl sm:text-5xl font-bold text-white">
                    Capital flows seamlessly.
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-slate-800 bg-[#111820]/90 p-6 text-center shadow-xl backdrop-blur-md">
                    <p className="text-3xl font-black text-teal-400">+12.4%</p>
                    <p className="mt-1 text-xs font-medium text-slate-300">Projected Return</p>
                    <p className="mt-2 text-[11px] text-slate-500">To the Lender</p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-[#111820]/90 p-6 text-center shadow-xl backdrop-blur-md">
                    <p className="text-3xl font-black text-cyan-400">98.6%</p>
                    <p className="mt-1 text-xs font-medium text-slate-300">On-Time Repayment</p>
                    <p className="mt-2 text-[11px] text-slate-500">Verified Platform Rate</p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-[#111820]/90 p-6 text-center shadow-xl backdrop-blur-md">
                    <p className="text-3xl font-black text-blue-400">100%</p>
                    <p className="mt-1 text-xs font-medium text-slate-300">Shared Auditability</p>
                    <p className="mt-2 text-[11px] text-slate-500">Zero Hidden Terms</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STAGE 7: P2P NETWORK (0.85 - 1.00) */}
          <AnimatePresence>
            {stage === 7 && (
              <motion.div
                key="stage-7"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="mx-auto max-w-2xl text-center"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                  <span>Decentralized P2P Network</span>
                </div>
                <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white">
                  One handshake becomes a network.
                </h2>
                <p className="mt-4 text-base text-slate-300">
                  Every successful loan strengthens the decentralized lending ecosystem. Join
                  thousands of peers building transparent financial freedom.
                </p>

                <div className="mt-8">
                  <Link
                    href="/auth/login"
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-8 text-sm font-bold text-[#0B0F14] shadow-lg shadow-teal-500/20 transition-all hover:opacity-90"
                  >
                    <span>Join the Flendly Network</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
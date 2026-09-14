"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { signInWithGoogle } from "@/lib/auth/actions";
import { GoogleSignInButton } from "@/components/users/google-sign-in-button";
import { RetroWindow } from "@/components/ui/retro-window";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

type LoginContentProps = {
  error?: string | null;
};

export function LoginContent({ error }: LoginContentProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-20 w-full max-w-md px-4"
    >
      <RetroWindow
        title="flendly.os // auth.login"
        subtitle="v1.0"
        glow={true}
        className="border-teal-500/30 bg-[#0E141D] shadow-[0_0_30px_-5px_rgba(45,212,191,0.22)]"
        headerClassName="bg-[#141B26]"
        contentClassName="p-6 sm:p-8"
        headerRight={
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-teal-400">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>SECURE_SESSION</span>
          </div>
        }
      >
        <motion.div variants={itemVariants} className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-400 to-cyan-500 font-mono text-sm font-bold text-slate-950 shadow-md shadow-teal-500/20 retro-raised">
            F
          </div>
          <div>
            <span className="font-mono text-xl font-bold tracking-tight text-white block">
              FLENDLY
            </span>
            <span className="font-mono text-[10px] text-teal-400 tracking-wider uppercase block">
              Peer-to-Peer Finance OS
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="font-heading text-2xl font-bold leading-tight text-white">
            Track lending with people you trust.
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
            Send a request, lock in terms, and keep one single source of truth instead of screenshots of bank transfers.
          </p>
        </motion.div>

        {error ? (
          <motion.p
            variants={itemVariants}
            className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2 font-mono text-xs text-red-400 font-medium"
          >
            [ERR]: {error}
          </motion.p>
        ) : null}

        <motion.form
          variants={itemVariants}
          action={signInWithGoogle}
          className="mt-7"
        >
          <GoogleSignInButton />
        </motion.form>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-center font-mono text-[11px] leading-relaxed text-slate-400"
        >
          Your email and phone number are private by default — you choose who,
          if anyone, can see them.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-6 flex justify-center gap-5 text-xs text-slate-400 pt-4 border-t border-white/5 font-mono text-[11px]"
        >
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            <span className="text-slate-300">Private Ledger</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Instant Sync</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span className="text-slate-300">Zero Fees</span>
          </div>
        </motion.div>
      </RetroWindow>
    </motion.div>
  );
}

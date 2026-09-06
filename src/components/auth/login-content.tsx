"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { signInWithGoogle } from "@/lib/auth/actions";
import { GoogleSignInButton } from "@/components/users/google-sign-in-button";
import { BorderBeam } from "@/components/ui/border-beam";

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
      className="relative z-10 w-full max-w-md"
    >
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Glowing border beam animation - slower */}
        <BorderBeam
          colorFrom="#3b82f6"
          colorTo="#8b5cf6"
          duration={8}
          width={1.5}
        />

        <motion.div variants={itemVariants} className="mb-8 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 font-heading text-base font-bold text-white shadow-lg shadow-blue-500/30">
            F
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-white">
            Flendly
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-3">
          <h1 className="font-heading text-2xl font-bold leading-tight text-white sm:text-3xl">
            Track lending with people you trust.
          </h1>
          <p className="text-base leading-7 text-slate-300">
            Send a request, agree on terms, and keep one shared ledger instead of a
            screenshot of a bank transfer.
          </p>
        </motion.div>

        {error ? (
          <motion.p
            variants={itemVariants}
            className="mt-6 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        ) : null}

        <motion.form
          variants={itemVariants}
          action={signInWithGoogle}
          className="mt-8"
        >
          <GoogleSignInButton />
        </motion.form>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-center text-xs leading-5 text-slate-400"
        >
          Your email and phone number are private by default — you choose who,
          if anyone, can see them.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-8 flex justify-center gap-6 text-sm text-slate-400"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Secure & Private</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-400" />
            <span>Easy Setup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-400" />
            <span>Transparent</span>
          </div>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

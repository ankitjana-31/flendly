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
      className="relative z-20 w-full max-w-md"
    >
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-[#111820]/95 p-7 sm:p-8 shadow-2xl shadow-blue-500/20 backdrop-blur-2xl"
      >
        {/* Glowing border beam animation with ambient blur */}
        <BorderBeam
          colorFrom="#3b82f6"
          colorTo="#8b5cf6"
          duration={7}
          borderWidth={1.5}
          glow={true}
        />

        <motion.div variants={itemVariants} className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-400 to-blue-500 font-heading text-sm font-bold text-black shadow-lg shadow-teal-500/20">
            F
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-white">
            Flendly
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="font-heading text-2xl font-bold leading-tight text-white">
            Track lending with people you trust.
          </h1>
          <p className="text-sm leading-6 text-slate-300">
            Send a request, agree on terms, and keep one shared ledger instead of a
            screenshot of a bank transfer.
          </p>
        </motion.div>

        {error ? (
          <motion.p
            variants={itemVariants}
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs text-red-400 font-medium"
          >
            {error}
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
          className="mt-6 text-center text-[11px] leading-4 text-slate-400"
        >
          Your email and phone number are private by default — you choose who,
          if anyone, can see them.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-6 flex justify-center gap-6 text-xs text-slate-400 pt-2 border-t border-white/5"
        >
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            <span className="text-slate-300">Secure & Private</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-slate-300">Easy Setup</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span className="text-slate-300">Transparent</span>
          </div>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

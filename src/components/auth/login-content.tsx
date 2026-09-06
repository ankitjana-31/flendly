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
        className="relative overflow-hidden rounded-3xl border border-border bg-card/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/90"
      >
        {/* Glowing border beam animation - travels along border */}
        <BorderBeam
          colorFrom="#3b82f6"
          colorTo="#8b5cf6"
          duration={8}
          size={30}
          borderWidth={1}
        />

        <motion.div variants={itemVariants} className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 font-heading text-sm font-bold text-white shadow-lg shadow-blue-500/30">
            F
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            Flendly
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="font-heading text-xl font-bold leading-tight text-foreground sm:text-2xl">
            Track lending with people you trust.
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Send a request, agree on terms, and keep one shared ledger instead of a
            screenshot of a bank transfer.
          </p>
        </motion.div>

        {error ? (
          <motion.p
            variants={itemVariants}
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400"
          >
            {error}
          </motion.p>
        ) : null}

        <motion.form
          variants={itemVariants}
          action={signInWithGoogle}
          className="mt-6"
        >
          <GoogleSignInButton />
        </motion.form>

        <motion.p
          variants={itemVariants}
          className="mt-5 text-center text-[11px] leading-4 text-muted-foreground"
        >
          Your email and phone number are private by default — you choose who,
          if anyone, can see them.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-6 flex justify-center gap-5 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Secure & Private</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span>Easy Setup</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span>Transparent</span>
          </div>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

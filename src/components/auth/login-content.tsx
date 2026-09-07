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
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111820] p-7 sm:p-8 shadow-2xl shadow-black/80"
      >
        {/* Glowing edge borders - top and sides */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/30 via-transparent to-indigo-500/30 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/30 via-transparent to-cyan-500/30 pointer-events-none" />

        {/* Corner glows */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Sleek edge-only border beam */}
        <BorderBeam
          colorFrom="#38bdf8"
          colorTo="#818cf8"
          duration={7}
          borderWidth={1}
          glow={false}
        />

        <motion.div variants={itemVariants} className="mb-6 flex items-center gap-2.5 relative z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-400 to-blue-500 font-heading text-sm font-bold text-black shadow-lg shadow-teal-500/20">
            F
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-white">
            Flendly
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2 relative z-10">
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
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs text-red-400 font-medium relative z-10"
          >
            {error}
          </motion.p>
        ) : null}

        <motion.form
          variants={itemVariants}
          action={signInWithGoogle}
          className="mt-7 relative z-10"
        >
          <div className="group relative rounded-xl border border-white/15 bg-white/[0.03] p-4 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/40 hover:bg-white/[0.08]">
            {/* Glass morphism effect on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-br from-cyan-400/10 via-white/5 to-indigo-400/10 pointer-events-none" />

            {/* Subtle glow on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg shadow-cyan-500/20 pointer-events-none" />

            <div className="relative z-10">
              <GoogleSignInButton />
            </div>
          </div>
        </motion.form>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-center text-[11px] leading-4 text-slate-400 relative z-10"
        >
          Your email and phone number are private by default — you choose who,
          if anyone, can see them.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-6 flex justify-center gap-6 text-xs text-slate-400 pt-3 border-t border-white/5 relative z-10"
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

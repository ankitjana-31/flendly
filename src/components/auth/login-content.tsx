"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
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
        title="FLENDLY // AUTHENTICATION"
        subtitle="SECURE SESSION"
        colorBar="blue"
        glow={true}
        className="bg-[var(--card)] border-[2.5px] border-[var(--border)] shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#2563EB]"
        headerClassName="bg-[var(--primary)] text-[var(--primary-foreground)]"
        contentClassName="p-6 sm:p-8"
      >
        <motion.div variants={itemVariants} className="mb-6 flex items-center gap-3">
          <Image
            src="/brand/flendly-symbol.svg"
            alt="Flendly"
            width={44}
            height={44}
            className="h-11 w-11 shrink-0"
          />
          <div>
            <span className="font-mono text-xl font-bold tracking-tight text-[var(--foreground)] block">
              FLENDLY
            </span>
            <span className="font-mono text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-bold tracking-wider uppercase block">
              Peer-to-Peer Finance
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="font-heading text-2xl font-bold leading-tight text-[var(--foreground)]">
            Track money between people you trust.
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed text-[var(--muted-foreground)]">
            Create a loan, agree on the terms, and keep track of repayments.
          </p>
        </motion.div>

        {error ? (
          <motion.p
            variants={itemVariants}
            className="mt-4 border-[2px] border-black bg-[#F43F5E]/15 p-3 font-mono text-xs text-[#F43F5E] font-bold shadow-[2px_2px_0_0_#000000] rounded-[6px]"
          >
            [ERR]: {error}
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
          className="mt-5 text-center font-mono text-[11px] leading-relaxed text-gray-500 dark:text-gray-400"
        >
          Your account details stay private.
        </motion.p>
      </RetroWindow>
    </motion.div>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import React, { type ButtonHTMLAttributes, type ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-primary text-primary-foreground hover:opacity-95 shadow-sm",
  secondary: "bg-muted text-foreground hover:bg-border/60",
  outline: "border border-border text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  danger: "bg-danger text-white hover:opacity-95 shadow-sm",
};

const sizes = {
  sm: "h-9 px-3",
  md: "h-11 px-4",
  lg: "h-12 px-6",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export interface MotionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function MotionButton({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: MotionButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      whileHover={shouldReduceMotion || disabled ? undefined : { scale: 1.02 }}
      whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}

export function MotionCard({
  className = "",
  children,
  hoverable = true,
  onClick,
}: {
  className?: string;
  children: ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        shouldReduceMotion || !hoverable
          ? undefined
          : { y: -2, transition: { duration: 0.2 } }
      }
      whileTap={
        shouldReduceMotion || !hoverable ? undefined : { scale: 0.99 }
      }
      onClick={onClick}
      className={`rounded-2xl border border-border bg-card transition-shadow ${
        hoverable ? "hover:shadow-md cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

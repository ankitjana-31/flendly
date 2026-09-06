"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import React from "react";

const animations: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0 },
  },
};

export interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: keyof typeof animations;
  delay?: number;
  duration?: number;
  className?: string;
  layout?: boolean | "position" | "size";
}

export function AnimatedContainer({
  children,
  animation = "fadeInUp",
  delay = 0,
  duration = 0.4,
  className,
  layout,
}: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={animations[animation]}
      initial="hidden"
      animate="visible"
      layout={layout}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

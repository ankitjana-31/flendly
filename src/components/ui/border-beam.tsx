"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
  glow?: boolean;
}

export const BorderBeam = ({
  className,
  duration = 6,
  colorFrom = "#3b82f6",
  colorTo = "#60a5fa",
  borderWidth = 1.5,
  glow = true,
}: BorderBeamProps) => {
  return (
    <>
      {/* Outer ambient blur glow around the card border */}
      {glow && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 -z-20 rounded-[inherit] opacity-70 blur-xl"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${colorFrom} 45deg, ${colorTo} 100deg, transparent 160deg)`,
          }}
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: duration,
          }}
        />
      )}

      {/* Crisp glowing border line */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]",
          className
        )}
        style={{ padding: `${borderWidth}px` }}
      >
        <motion.div
          className="absolute -inset-[150%] aspect-square"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${colorFrom} 45deg, ${colorTo} 100deg, transparent 160deg)`,
          }}
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: duration,
          }}
        />
        {/* Inner cutout matching the card background */}
        <div className="h-full w-full rounded-[inherit] bg-card/95 backdrop-blur-md" />
      </div>
    </>
  );
};


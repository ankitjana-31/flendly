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
  duration = 7,
  colorFrom = "#38bdf8",
  colorTo = "#818cf8",
  borderWidth = 1,
  glow = true,
}: BorderBeamProps) => {
  return (
    <>
      {/* Sleek outer edge glow (strictly outside boundary, not inside) */}
      {glow && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[1px] -z-20 rounded-[inherit] opacity-40 blur-sm"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${colorFrom} 40deg, ${colorTo} 90deg, transparent 150deg)`,
          }}
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: duration,
          }}
        />
      )}

      {/* Crisp 1px traveling border line */}
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
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${colorFrom} 40deg, ${colorTo} 90deg, transparent 150deg)`,
          }}
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: duration,
          }}
        />
        {/* Solid inner mask to ensure 0% glow bleed inside */}
        <div className="h-full w-full rounded-[inherit] bg-[#111820]" />
      </div>
    </>
  );
};

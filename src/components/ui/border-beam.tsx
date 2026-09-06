"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

export const BorderBeam = ({
  className,
  size = 300,
  duration = 10,
  delay = 0,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
}: BorderBeamProps) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className,
      )}
    >
      <div
        className="absolute inset-0 [border-radius:inherit]"
        style={
          {
            "--size": size,
            "--duration": duration,
            "--delay": delay,
            "--color-from": colorFrom,
            "--color-to": colorTo,
            animation: `beam var(--duration)s infinite`,
            animationDelay: `var(--delay)s`,
            background: `conic-gradient(from 90deg at 50% 0%, var(--color-from), var(--color-to), var(--color-from))`,
            backgroundSize: `calc(var(--size) * 2) calc(var(--size) * 2)`,
            backgroundPosition: "0% 0%",
            opacity: 0.5,
            WebkitMaskImage: `radial-gradient(circle at center, black, transparent 80%)`,
            maskImage: `radial-gradient(circle at center, black, transparent 80%)`,
          } as React.CSSProperties
        }
      />
      <style>{`
        @keyframes beam {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: calc(var(--size) * 2) calc(var(--size) * 2);
          }
        }
      `}</style>
    </div>
  );
};

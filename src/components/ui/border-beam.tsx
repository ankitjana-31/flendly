"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  width?: number;
}

export const BorderBeam = ({
  className,
  size = 300,
  duration = 10,
  delay = 0,
  colorFrom = "#3b82f6",
  colorTo = "#8b5cf6",
  width = 2,
}: BorderBeamProps) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className,
      )}
      style={
        {
          "--duration": `${duration}s`,
          "--delay": `${delay}s`,
        } as React.CSSProperties
      }
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          animation: `beam-orbit var(--duration) linear infinite`,
          animationDelay: `var(--delay)`,
        } as React.CSSProperties}
      >
        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          fill="none"
          stroke={`url(#beam-gradient)`}
          strokeWidth={width}
          opacity="0.8"
        />
        <defs>
          <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="50%" stopColor={colorTo} />
            <stop offset="100%" stopColor={colorFrom} />
          </linearGradient>
        </defs>
      </svg>
      <style>{`
        @keyframes beam-orbit {
          0% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.3;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};


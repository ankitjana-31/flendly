"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface RetroWindowProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  headerRight?: React.ReactNode;
  glow?: boolean;
  variant?: "default" | "active" | "terminal" | "glass";
}

export function RetroWindow({
  title = "flendly.os",
  subtitle,
  icon,
  children,
  className,
  headerClassName,
  contentClassName,
  headerRight,
  glow = false,
  variant = "default",
}: RetroWindowProps) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border transition-all duration-300",
        // Dark & light theme background & borders
        "border-[#1E2935] bg-[#0E131A] text-slate-100 shadow-2xl",
        "dark:border-[#1E2935] dark:bg-[#0E131A] dark:text-slate-100",
        glow && "border-teal-500/40 shadow-[0_0_25px_-5px_rgba(45,212,191,0.2)]",
        variant === "glass" && "bg-[#0E131A]/80 backdrop-blur-xl border-white/10",
        variant === "terminal" && "border-teal-500/30 bg-[#080C10] font-mono",
        className
      )}
    >
      {/* Sleek outer edge glow highlight if enabled */}
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[1px] -z-10 rounded-[inherit] opacity-40 blur-[2px] transition-opacity group-hover:opacity-60"
          style={{
            background:
              "linear-gradient(135deg, rgba(45,212,191,0.4) 0%, rgba(56,189,248,0.2) 50%, rgba(129,140,248,0.3) 100%)",
          }}
        />
      )}

      {/* Retro OS Window Title Bar */}
      <div
        className={cn(
          "flex items-center justify-between border-b border-[#1E2935] px-4 py-3 select-none",
          "bg-[#141B24]/90 rounded-t-2xl",
          headerClassName
        )}
      >
        {/* Left: Window Control Dots (Retro Traffic Lights) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 transition-transform duration-150 group-hover:scale-105" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 transition-transform duration-150 group-hover:scale-105" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 transition-transform duration-150 group-hover:scale-105" />
          </div>

          {/* Optional Icon */}
          {icon && <span className="ml-2 text-slate-400">{icon}</span>}

          {/* Monospace Title */}
          {title && (
            <div className="ml-2 flex items-center gap-2">
              <span className="font-mono text-xs font-medium tracking-wide text-slate-300">
                {title}
              </span>
              {subtitle && (
                <span className="hidden font-mono text-[10px] text-slate-500 sm:inline">
                  — {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side controls or status */}
        <div className="flex items-center gap-2">
          {headerRight ? (
            headerRight
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="hidden sm:inline text-teal-400/90">ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={cn("p-6", contentClassName)}>{children}</div>
    </div>
  );
}

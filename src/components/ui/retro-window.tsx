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
  colorBar?: "blue" | "yellow" | "pink" | "green" | "dark" | "default";
  controlsStyle?: "win95" | "traffic";
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
  colorBar = "default",
  controlsStyle = "win95",
}: RetroWindowProps) {
  // Title bar colors based on Stitch project screens
  const titleBarStyles = {
    blue: "bg-[#2563EB] text-white border-b-[2.5px] border-black dark:border-white/70",
    yellow: "bg-[#FFE600] text-black border-b-[2.5px] border-black dark:border-white/70 font-bold",
    pink: "bg-[#F43F5E] text-white border-b-[2.5px] border-black dark:border-white/70",
    green: "bg-[#059669] text-white border-b-[2.5px] border-black dark:border-white/70",
    dark: "bg-[#141B26] text-white border-b-[2.5px] border-[#1E2935]",
    default: "bg-[#2563EB] text-white border-b-[2.5px] border-black dark:border-white/70",
  }[colorBar];

  return (
    <div
      className={cn(
        "group relative rounded-sm border-[2.5px] border-black bg-white dark:border-[#3A3F55] dark:bg-[#161821] transition-all duration-200",
        "shadow-[5px_5px_0_0_#000000] dark:shadow-[5px_5px_0_0_rgba(0,0,0,0.8)]",
        glow && "shadow-[0_0_25px_-4px_rgba(45,212,191,0.35),5px_5px_0_0_#000000]",
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
          "flex h-10 items-center justify-between px-3 select-none",
          titleBarStyles,
          headerClassName
        )}
      >
        {/* Left: Window Control or Title */}
        <div className="flex items-center gap-2">
          {controlsStyle === "traffic" ? (
            <div className="flex items-center gap-1.5 mr-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
            </div>
          ) : (
            <span className="inline-flex h-4 w-4 items-center justify-center border border-black bg-[#FFE600] text-[10px] font-mono font-bold text-black shadow-sm">
              ▲
            </span>
          )}

          {icon && <span className="text-current opacity-80">{icon}</span>}

          {title && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-wider uppercase">
                {title}
              </span>
              {subtitle && (
                <span className="hidden font-mono text-[10px] opacity-75 sm:inline">
                  — {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side: Win95 Window Buttons or custom actions */}
        <div className="flex items-center gap-1">
          {headerRight ? (
            headerRight
          ) : controlsStyle === "win95" ? (
            <div className="flex items-center gap-1">
              <span className="flex h-5 w-5 items-center justify-center border border-black bg-white text-[10px] font-mono font-bold text-black shadow-sm">
                _
              </span>
              <span className="flex h-5 w-5 items-center justify-center border border-black bg-white text-[10px] font-mono font-bold text-black shadow-sm">
                □
              </span>
              <span className="flex h-5 w-5 items-center justify-center border border-black bg-[#F43F5E] text-[10px] font-mono font-bold text-white shadow-sm">
                ✕
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-mono text-teal-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="hidden sm:inline">ONLINE</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={cn("p-6 text-gray-900 dark:text-gray-100", contentClassName)}>{children}</div>
    </div>
  );
}

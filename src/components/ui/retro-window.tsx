"use client";

import React, { useState } from "react";
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
  onClose?: () => void;
  defaultMinimized?: boolean;
}

export function RetroWindow({
  title = "FLENDLY",
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
  // Title bar colors based on Stitch project styling
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
      {/* Outer edge glow highlight if enabled */}
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

      {/* Retro Window Title Bar */}
      <div
        className={cn(
          "flex h-11 items-center justify-between px-3.5 select-none",
          titleBarStyles,
          headerClassName
        )}
      >
        {/* Left: Window Icon or Title */}
        <div className="flex items-center gap-2 overflow-hidden">
          {controlsStyle === "traffic" ? (
            <div className="flex items-center gap-1.5 mr-2">
              <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 inline-block" />
              <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 inline-block" />
              <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 inline-block" />
            </div>
          ) : (
            <span className="inline-flex h-4.5 w-4.5 items-center justify-center border border-black bg-[#FFE600] text-[10px] font-mono font-bold text-black shadow-sm select-none">
              ▲
            </span>
          )}

          {icon && <span className="text-current opacity-80 shrink-0">{icon}</span>}

          {title && (
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase truncate">
                {title}
              </span>
              {subtitle && (
                <span className="hidden font-mono text-xs opacity-85 sm:inline truncate">
                  — {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side: Static Retro Win95 Window Controls or custom actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {headerRight}

          {controlsStyle === "win95" && (
            <div className="flex items-center gap-1 ml-1.5 select-none" aria-hidden="true">
              <span className="flex h-5.5 w-5.5 items-center justify-center border border-black bg-white text-xs font-mono font-black text-black shadow-[1px_1px_0_0_#000]">
                _
              </span>
              <span className="flex h-5.5 w-5.5 items-center justify-center border border-black bg-white text-[11px] font-mono font-black text-black shadow-[1px_1px_0_0_#000]">
                □
              </span>
              <span className="flex h-5.5 w-5.5 items-center justify-center border border-black bg-[#F43F5E] text-[11px] font-mono font-black text-white shadow-[1px_1px_0_0_#000]">
                ✕
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={cn("p-5 sm:p-6 text-gray-900 dark:text-gray-100", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

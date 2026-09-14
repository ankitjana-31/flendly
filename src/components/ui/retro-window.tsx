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
  onClose,
  defaultMinimized = false,
}: RetroWindowProps) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed) {
    return null;
  }

  // Title bar colors based on Stitch project styling
  const titleBarStyles = {
    blue: "bg-[#2563EB] text-white border-b-[2.5px] border-black dark:border-white/70",
    yellow: "bg-[#FFE600] text-black border-b-[2.5px] border-black dark:border-white/70 font-bold",
    pink: "bg-[#F43F5E] text-white border-b-[2.5px] border-black dark:border-white/70",
    green: "bg-[#059669] text-white border-b-[2.5px] border-black dark:border-white/70",
    dark: "bg-[#141B26] text-white border-b-[2.5px] border-[#1E2935]",
    default: "bg-[#2563EB] text-white border-b-[2.5px] border-black dark:border-white/70",
  }[colorBar];

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsClosed(true);
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-sm border-[2.5px] border-black bg-white dark:border-[#3A3F55] dark:bg-[#161821] transition-all duration-200",
        "shadow-[5px_5px_0_0_#000000] dark:shadow-[5px_5px_0_0_rgba(0,0,0,0.8)]",
        glow && "shadow-[0_0_25px_-4px_rgba(45,212,191,0.35),5px_5px_0_0_#000000]",
        isMaximized && "fixed inset-3 md:inset-6 z-50 overflow-auto shadow-[10px_10px_0_0_#000000] dark:shadow-[10px_10px_0_0_#2563EB]",
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
          "flex h-10 items-center justify-between px-3 select-none",
          titleBarStyles,
          headerClassName
        )}
      >
        {/* Left: Window Control or Title */}
        <div className="flex items-center gap-2 overflow-hidden">
          {controlsStyle === "traffic" ? (
            <div className="flex items-center gap-1.5 mr-2">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close window"
                className="h-2.5 w-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 hover:opacity-80 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label="Minimize window"
                className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 hover:opacity-80 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                aria-label="Maximize window"
                className="h-2.5 w-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 hover:opacity-80 cursor-pointer"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              aria-label="Toggle minimize"
              className="inline-flex h-4 w-4 items-center justify-center border border-black bg-[#FFE600] text-[10px] font-mono font-bold text-black shadow-sm hover:bg-yellow-300 cursor-pointer"
            >
              {isMinimized ? "▼" : "▲"}
            </button>
          )}

          {icon && <span className="text-current opacity-80 shrink-0">{icon}</span>}

          {title && (
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase truncate">
                {title}
              </span>
              {subtitle && (
                <span className="hidden font-mono text-[11px] opacity-80 sm:inline truncate">
                  — {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side: Interactive Win95 Window Buttons or custom actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {headerRight}

          {controlsStyle === "win95" && (
            <div className="flex items-center gap-1 ml-1.5">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand Window" : "Minimize Window"}
                className="flex h-5 w-5 items-center justify-center border border-black bg-white text-[11px] font-mono font-black text-black shadow-[1px_1px_0_0_#000] hover:bg-[#FFE600] active:translate-y-0.5 cursor-pointer"
              >
                _
              </button>
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? "Restore Window" : "Maximize Window"}
                className="flex h-5 w-5 items-center justify-center border border-black bg-white text-[10px] font-mono font-black text-black shadow-[1px_1px_0_0_#000] hover:bg-[#2DD4BF] active:translate-y-0.5 cursor-pointer"
              >
                {isMaximized ? "❐" : "□"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                title="Close Window"
                className="flex h-5 w-5 items-center justify-center border border-black bg-[#F43F5E] text-[10px] font-mono font-black text-white shadow-[1px_1px_0_0_#000] hover:bg-rose-700 active:translate-y-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area (collapsible when minimized) */}
      {!isMinimized ? (
        <div className={cn("p-5 sm:p-6 text-gray-900 dark:text-gray-100", contentClassName)}>
          {children}
        </div>
      ) : (
        <div
          onClick={() => setIsMinimized(false)}
          className="p-3 bg-[#FAF8F5] dark:bg-[#1E212D] text-center font-mono text-xs text-gray-500 hover:text-black dark:hover:text-white cursor-pointer hover:bg-yellow-50 dark:hover:bg-[#252A3A] transition-colors border-t border-black/10 flex items-center justify-center gap-2 font-bold"
        >
          <span>[WINDOW MINIMIZED — CLICK TO EXPAND]</span>
        </div>
      )}
    </div>
  );
}

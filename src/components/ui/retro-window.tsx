"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface RetroWindowProps {
  title?: React.ReactNode;
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
  onMaximize?: () => void;
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
  onMaximize,
  defaultMinimized = false,
}: RetroWindowProps) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [windowAnimation, setWindowAnimation] = useState<"maximize" | "minimize" | "restore" | "close" | "reopen" | null>(null);
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (animationTimeout.current) clearTimeout(animationTimeout.current);
    };
  }, []);

  const runAnimation = (
    animation: "maximize" | "minimize" | "restore" | "close" | "reopen",
    callback?: () => void,
    duration = animation === "close" ? 3600 : animation === "restore" || animation === "reopen" ? 700 : 3600,
  ) => {
    if (animationTimeout.current) clearTimeout(animationTimeout.current);
    setWindowAnimation(animation);
    animationTimeout.current = setTimeout(() => {
      animationTimeout.current = null;
      setWindowAnimation(null);
      callback?.();
    }, duration);
  };

  const handleMinimize = () => {
    if (isMinimized) {
      setIsMinimized(false);
      runAnimation("restore");
      return;
    }
    runAnimation("minimize", () => setIsMinimized(true));
  };

  const handleMaximize = () => {
    if (isMinimized) {
      setIsMinimized(false);
      runAnimation("restore");
      return;
    }
    runAnimation("maximize", onMaximize);
  };

  const handleClose = () => {
    if (onClose) {
      runAnimation("close", onClose);
      return;
    }
    runAnimation("close", () => runAnimation("reopen"));
  };
  const windowTitle = typeof title === "string" && title.includes(" // ")
    ? (() => {
        const [primary, secondary] = title.split(" // ");
        return (
          <>
            <span>{primary}</span>
            <span className="hidden sm:inline"> // {secondary}</span>
          </>
        );
      })()
    : title;

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
        "group relative rounded-sm border-[2.5px] border-black bg-white dark:border-[#3A3F55] dark:bg-[#161821] transition-all duration-200 w-full max-w-full",
        "shadow-[4px_4px_0_0_#000000] dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.8)]",
        glow && "shadow-[0_0_25px_-4px_rgba(45,212,191,0.35),4px_4px_0_0_#000000]",
        windowAnimation && `retro-window-${windowAnimation}`,
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
        data-window-titlebar
        className={cn(
          "flex min-h-10 sm:min-h-11 items-center justify-between gap-2 px-2.5 sm:px-3.5 select-none min-w-0 max-w-full",
          titleBarStyles,
          headerClassName
        )}
      >
        {/* Left: Window Icon or Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 mr-2">
          {controlsStyle === "traffic" ? (
            <div className="flex items-center gap-1.5 mr-2 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 inline-block cursor-pointer hover:opacity-80"
              />
              <button
                type="button"
                onClick={handleMinimize}
                className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 inline-block cursor-pointer hover:opacity-80"
              />
              <button
                type="button"
                onClick={handleMaximize}
                className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 inline-block cursor-pointer hover:opacity-80"
              />
            </div>
          ) : (
            <span className="inline-flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center border border-black bg-[#FFE600] text-[9px] sm:text-[10px] font-mono font-bold text-black shadow-sm select-none shrink-0">
              ▲
            </span>
          )}

          {icon && <span className="text-current opacity-80 shrink-0">{icon}</span>}

          {title && (
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
              <span className="font-mono text-[10px] sm:text-sm font-black tracking-wider uppercase whitespace-nowrap">
                {windowTitle}
              </span>
              {subtitle && (
                <span className="hidden sm:inline font-mono text-[9px] sm:text-xs opacity-85 whitespace-nowrap">
                  — {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side: Interactive Retro Win95 Window Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {headerRight}

          {controlsStyle === "win95" && (
            <div className="hidden sm:flex items-center gap-1 ml-1.5 select-none">
              <button
                type="button"
                onClick={handleMinimize}
                className="retro-win-btn"
                title={isMinimized ? "Restore" : "Minimize"}
              >
                _
              </button>
              <button
                type="button"
                onClick={handleMaximize}
                className="retro-win-btn"
                title="Maximize / Open Page"
              >
                □
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="retro-win-btn retro-win-btn-close"
                title="Close Window"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      {!isMinimized && (
        <div className={cn("p-4 sm:p-5 text-gray-900 dark:text-gray-100", contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}

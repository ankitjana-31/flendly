"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-8 w-24 border-[2px] border-black bg-[#FFE600] opacity-50 ${className ?? ""}`} />
    );
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle retro theme mode"
      className={`flex items-center gap-1.5 px-2.5 py-1 border-[2px] border-black dark:border-white bg-[#FFE600] dark:bg-[#1E212D] text-black dark:text-[#FFE600] shadow-[2px_2px_0_0_#000000] dark:shadow-[2px_2px_0_0_#FFE600] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-mono text-[11px] font-bold cursor-pointer transition-all ${className ?? ""}`}
    >
      {isDark ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden sm:inline">LIGHT.SYS</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-black" />
          <span className="hidden sm:inline">DARK.SYS</span>
        </>
      )}
    </button>
  );
}

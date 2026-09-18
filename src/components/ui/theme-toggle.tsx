"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Palette } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className={`h-8 w-24 border-[2px] border-black bg-[#FFE600] opacity-50 ${className ?? ""}`} />
    );
  }

  const activeTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <button
      type="button"
      onClick={() => {
        const themes = ["light", "dark", "ocean", "sunset", "tropical"];
        const nextTheme = themes[(themes.indexOf(activeTheme ?? "light") + 1) % themes.length];
        setTheme(nextTheme);
      }}
      aria-label={`Change theme (current: ${activeTheme ?? "light"})`}
      className={`theme-toggle flex items-center gap-1.5 px-2.5 py-1 border-[2px] border-[var(--border)] bg-[var(--accent)] !text-black shadow-[2px_2px_0_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-mono text-[11px] font-bold cursor-pointer transition-all ${className ?? ""}`}
    >
      <Palette className="h-3.5 w-3.5" />
      <span>THEME.SYS</span>
    </button>
  );
}

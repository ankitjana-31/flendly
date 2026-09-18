"use client";

import { useLanguage, type SupportedLanguage, LANGUAGES } from "@/lib/i18n/language-context";
import { useSyncExternalStore } from "react";
import { Globe } from "lucide-react";

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className={`h-8 w-20 border-[2px] border-black bg-white dark:bg-[var(--card)] opacity-50 ${className ?? ""}`} />
    );
  }

  const cycleLanguage = () => {
    const order: SupportedLanguage[] = ["en", "hi", "bn"];
    const nextIndex = (order.indexOf(language) + 1) % order.length;
    setLanguage(order[nextIndex]);
  };

  const currentInfo = LANGUAGES[language] || LANGUAGES.en;

  return (
    <button
      type="button"
      onClick={cycleLanguage}
      aria-label={`Change language (current: ${currentInfo.name})`}
      title={`Current: ${currentInfo.name} (${currentInfo.nativeName}) - Click to switch`}
      className={`lang-toggle flex items-center gap-1.5 px-2.5 py-1 border-[2px] border-black dark:border-white/60 bg-white dark:bg-[var(--card)] text-black dark:text-white shadow-[2px_2px_0_0_#000000] hover:bg-[#FFE600] hover:text-black dark:hover:bg-[#FFE600] dark:hover:text-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-mono text-[11px] font-bold cursor-pointer transition-all select-none ${className ?? ""}`}
    >
      <Globe className="h-3.5 w-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
      <span className="font-mono font-black">{currentInfo.short}</span>
      <span className="text-[10px] text-gray-500 dark:text-gray-400">({currentInfo.nativeName})</span>
    </button>
  );
}

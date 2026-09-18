"use client";

import { useLanguage, type SupportedLanguage, LANGUAGES } from "@/lib/i18n/language-context";
import { useEffect, useState } from "react";
import { Check, Globe } from "lucide-react";

export function LanguageSettingsForm() {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-24 w-full animate-pulse rounded-sm border-[2px] border-black bg-card/50" />;
  }

  const options: { id: SupportedLanguage; title: string; native: string; desc: string }[] = [
    {
      id: "en",
      title: "English",
      native: "English",
      desc: "Default interface language",
    },
    {
      id: "hi",
      title: "Hindi",
      native: "हिन्दी",
      desc: "हिंदी नेविगेशन और लेजर",
    },
    {
      id: "bn",
      title: "Bengali",
      native: "বাংলা",
      desc: "বাংলা ইন্টারফেস ও হিসাব",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
      {options.map((item) => {
        const isSelected = language === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setLanguage(item.id)}
            className={`relative flex flex-col items-center justify-between min-h-[95px] p-3.5 border-[2px] border-black dark:border-white/40 rounded-sm text-center transition-all cursor-pointer shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0.5 ${
              isSelected
                ? "bg-[#FFE600] text-black shadow-[4px_4px_0_0_#000] -translate-y-0.5 font-black ring-2 ring-black"
                : "bg-white dark:bg-[var(--card)] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            }`}
          >
            {isSelected && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center border border-black bg-black text-white">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </span>
            )}
            <div className="flex h-7 w-7 items-center justify-center border border-black bg-white dark:bg-black/40 text-current mb-1 shadow-[1px_1px_0_0_#000]">
              <Globe className="h-3.5 w-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
            </div>
            <div className="w-full">
              <p className="text-xs sm:text-sm font-bold tracking-tight">
                {item.title} <span className="text-[11px] opacity-75">({item.native})</span>
              </p>
              <p className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? "text-black/80 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                {item.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

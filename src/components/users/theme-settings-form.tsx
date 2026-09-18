"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Waves, Sunset, Leaf, Check } from "lucide-react";

export function ThemeSettingsForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-28 w-full animate-pulse rounded-sm border-[2px] border-black bg-card/50" />;
  }

  const options = [
    {
      id: "light",
      name: "Light Mode",
      icon: Sun,
      desc: "Bright & crisp workspace",
    },
    {
      id: "dark",
      name: "Dark Mode",
      icon: Moon,
      desc: "Deep & easy on eyes",
    },
    { id: "ocean", name: "Ocean", icon: Waves, desc: "Cool navy blue palette" },
    { id: "sunset", name: "Sunset", icon: Sunset, desc: "Warm maroon workspace" },
    { id: "tropical", name: "Tropical", icon: Leaf, desc: "Deep teal forest theme" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
      {options.map((item) => {
        const Icon = item.icon;
        const isSelected = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTheme(item.id)}
            className={`theme-settings-option relative flex flex-col items-center justify-between min-h-[110px] p-3.5 border-[2px] border-black dark:border-white/40 rounded-sm text-center transition-all cursor-pointer shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0.5 ${
              isSelected
                ? "bg-[#FFE600] text-black shadow-[4px_4px_0_0_#000] -translate-y-0.5 font-black ring-2 ring-black"
                : "bg-white dark:bg-[#161821] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#1E212D]"
            }`}
          >
            {isSelected && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center border border-black bg-black text-white">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </span>
            )}
            <div className="flex h-8 w-8 items-center justify-center border border-black bg-white dark:bg-black/40 text-current mb-1 shadow-[1px_1px_0_0_#000]">
              <Icon className="h-4 w-4" />
            </div>
            <div className="w-full">
              <p className={`text-xs uppercase leading-tight ${isSelected ? "font-black text-black" : "font-bold text-black dark:text-white"}`}>
                {item.name}
              </p>
              <p className={`text-[10px] mt-1 leading-tight ${isSelected ? "text-black/80 font-bold" : "text-gray-600 dark:text-gray-300"}`}>
                {item.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

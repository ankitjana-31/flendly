"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";

export function ThemeSettingsForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-24 w-full animate-pulse rounded-xl bg-card/50" />;
  }

  const options = [
    {
      id: "light",
      name: "Light Mode",
      icon: Sun,
      desc: "Bright & crisp",
    },
    {
      id: "dark",
      name: "Dark Mode",
      icon: Moon,
      desc: "Deep & easy on eyes",
    },
    {
      id: "system",
      name: "System",
      icon: Laptop,
      desc: "Match OS preference",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((item) => {
        const Icon = item.icon;
        const isSelected = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTheme(item.id)}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border p-3.5 text-center transition-all ${
              isSelected
                ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20"
                : "border-border bg-background/50 text-muted-foreground hover:border-border/80 hover:bg-card"
            }`}
          >
            {isSelected && (
              <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </span>
            )}
            <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
            <div>
              <p className="text-xs font-semibold">{item.name}</p>
              <p className="text-[10px] text-muted-foreground/80">{item.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

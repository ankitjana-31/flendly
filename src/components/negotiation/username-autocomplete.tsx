"use client";

import { useEffect, useRef, useState } from "react";

type UserResult = { id: string; username: string; full_name: string | null };

export function UsernameAutocomplete({ defaultValue = "" }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<UserResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      const timer = setTimeout(() => setResults([]), 0);
      return () => clearTimeout(timer);
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        // aborted or network error — ignore
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor="receiverUsername">
        Send to (username)
      </label>
      <input
        id="receiverUsername"
        name="receiverUsername"
        type="text"
        autoComplete="off"
        required
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="ankitjana_01"
        className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-accent"
      />
      {open && results.length > 0 && (
        <ul className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  setQuery(r.username);
                  setOpen(false);
                }}
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">@{r.username}</span>
                {r.full_name && <span className="text-xs text-muted-foreground">{r.full_name}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Search, UserCheck, AlertCircle, Loader2 } from "lucide-react";

type UserResult = { id: string; username: string; full_name: string | null };

export function UsernameAutocomplete({ defaultValue = "" }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
        setHasSearched(true);
      } catch {
        // aborted or network error — ignore
      } finally {
        setIsLoading(false);
      }
    }, 150);

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

  const showNotFound = open && hasSearched && !isLoading && query.trim().length >= 2 && results.length === 0;

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5 font-mono">
      <label className="text-xs font-bold uppercase text-black dark:text-white flex items-center justify-between" htmlFor="receiverUsername">
        <span>Counterparty Username</span>
        {isLoading && (
          <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Searching...
          </span>
        )}
      </label>

      <div className="relative">
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
          placeholder="e.g. ankit"
          className="h-11 w-full border-[2px] border-black dark:border-white/60 bg-white dark:bg-[var(--card)] px-3 font-mono text-sm font-bold text-black dark:text-white shadow-[2px_2px_0_0_#000] outline-none transition-all focus:bg-[#FEF08A] focus:text-black"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
      </div>

      {/* Retro Styled Yellow Glow Popup Suggestions */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 overflow-hidden border-[2.5px] border-black bg-[#FEF08A] dark:bg-[#2D2812] shadow-[4px_4px_0_0_#000000] backdrop-blur-md">
          <div className="px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase flex items-center justify-between">
            <span>⚡ MATCHING REGISTERED PEERS</span>
            <span>CLICK TO SELECT</span>
          </div>
          <ul className="max-h-48 overflow-y-auto divide-y border-t border-black">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery(r.username);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs font-bold text-black dark:text-yellow-100 hover:bg-[#FFE600] dark:hover:bg-[#453D1A] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border border-black bg-white flex items-center justify-center text-[10px] font-black text-black">
                      @
                    </div>
                    <div>
                      <span className="font-black text-black dark:text-yellow-200">@{r.username}</span>
                      {r.full_name && (
                        <span className="block text-[10px] text-gray-700 dark:text-yellow-300/80 font-normal">
                          {r.full_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-black dark:text-yellow-200" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* User Not Found Retro Alert */}
      {showNotFound && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 p-3 border-[2.5px] border-black bg-[#F43F5E] text-white shadow-[4px_4px_0_0_#000]">
          <div className="flex items-center gap-2 text-xs font-black">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>USER NOT FOUND</span>
          </div>
          <p className="text-[11px] font-bold mt-1 text-white/90">
            &quot;{query}&quot; does not match any registered user. Please enter a valid username.
          </p>
        </div>
      )}
    </div>
  );
}

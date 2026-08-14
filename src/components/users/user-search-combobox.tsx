"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { searchUsers } from "@/lib/users/search";

interface FoundUser {
  id: string;
  username: string;
  full_name: string | null;
}

export function UserSearchCombobox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoundUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown on click outside
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const matching = await searchUsers(query);
        setResults(matching);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelectUser = (user: FoundUser) => {
    setQuery("");
    setResults([]);
    setFocused(false);
    // Navigate to create a request with this user as recipient
    router.push(`/requests/new?recipientId=${user.id}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex h-11 items-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#1A1C23] px-3 focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-100 overflow-hidden shadow-sm">
        <Search className="h-5 w-5 text-zinc-400 mr-2 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search by name or @username..."
          className="h-full flex-1 bg-transparent text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-zinc-400 shrink-0" />}
      </div>

      {focused && (query.trim().length > 0 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-[#1A1C23] shadow-lg overflow-hidden z-50 py-1">
          {results.length > 0 ? (
            results.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {user.full_name || "Monly User"}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    @{user.username}
                  </span>
                </div>
                <UserPlus className="h-4 w-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" />
              </button>
            ))
          ) : (
            !loading && (
              <div className="px-4 py-3 text-center text-sm text-zinc-500">
                No users found for &quot;{query}&quot;
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

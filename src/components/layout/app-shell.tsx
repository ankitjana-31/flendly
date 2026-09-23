"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { signOut } from "@/lib/auth/actions";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserAvatar } from "@/components/users/user-avatar";
import { createClient } from "@/lib/supabase/client";

// Standardized nav items with consistent styling
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "HomeIcon" },
  { href: "/lent", label: "Lent", icon: "ArrowUpIcon" },
  { href: "/borrowed", label: "Borrowed", icon: "ArrowDownIcon" },
  { href: "/requests", label: "Requests", icon: "InboxIcon" },
];

export function AppShell({
  children,
  fullName,
  username,
  avatarUrl,
  unreadCount: initialUnreadCount = 0,
}: {
  children: React.ReactNode;
  fullName: string | null;
  username: string;
  avatarUrl?: string | null;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [launcherPosition, setLauncherPosition] = useState({ x: 12, y: 12 });
  const launcherDrag = useRef<{ pointerId: number; offsetX: number; offsetY: number; moved: boolean } | null>(null);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  // Realtime Supabase listener for notifications counter
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("app_shell_notifications_counter")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => {
          setUnreadCount((c) => c + 1);
          startTransition(() => router.refresh());
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload) => {
          const wasUnread = !payload.old.read_at;
          const isUnread = !payload.new.read_at;
          if (wasUnread !== isUnread) {
            setUnreadCount((count) => Math.max(0, count + (isUnread ? 1 : -1)));
          }
          startTransition(() => router.refresh());
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications" },
        (payload) => {
          if (!payload.old.read_at) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          startTransition(() => router.refresh());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <div className="relative flex w-full bg-[var(--background)] text-[var(--foreground)] transition-colors">
      {/* Ambient Retro Geometric Grid Layer */}
      <div
        aria-hidden="true"
        className="app-shell-grid pointer-events-none fixed inset-0 opacity-[0.06] dark:opacity-[0.05] [background-image:radial-gradient(#000000_1.5px,transparent_1.5px),linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] dark:[background-image:radial-gradient(#ffffff_1px,transparent_1px),linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px,64px_64px,64px_64px]"
      />

      {/* FIXED Sidebar — Collapsible on ✕ click */}
      {!isSidebarCollapsed ? (
        <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 lg:w-72 flex-col justify-between border-r-[2.5px] border-[var(--border)] bg-[var(--card)] px-4 py-4 md:flex shadow-[4px_0_0_0_#000000] dark:shadow-[4px_0_0_0_rgba(0,0,0,0.5)] select-none overflow-hidden transition-all duration-200">
          <div className="flex flex-col gap-3 min-h-0 flex-1">
            {/* Retro Window Title / Logo */}
            <div className="px-1 shrink-0">
              <div className="flex items-center justify-between mb-2.5 border-b-[2px] border-black dark:border-white/20 pb-1.5">
                <span className="font-mono text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">FLENDLY ENVIRONMENT</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed(true)}
                    className="w-4 h-4 bg-[#FFE600] border border-black inline-flex items-center justify-center text-[9px] font-bold text-black cursor-pointer hover:bg-yellow-300"
                    title="Collapse Sidebar"
                  >
                    _
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed(true)}
                    className="w-4 h-4 bg-[#F43F5E] border border-black inline-flex items-center justify-center text-[9px] font-bold text-white cursor-pointer hover:bg-red-600"
                    title="Collapse Sidebar"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <Link href="/dashboard" className="flex items-center gap-2.5" prefetch={true}>
                <Image
                  src="/brand/flendly-symbol.svg"
                  alt="Flendly"
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0"
                />
                <div>
                  <span className="font-mono text-base lg:text-lg font-black tracking-tight text-[var(--foreground)] block leading-none">
                    FLENDLY
                  </span>
                  <span className="font-mono text-[9px] uppercase font-bold text-[#2563EB] dark:text-[#60A5FA] block mt-0.5 tracking-wider">
                    PAYMENT TRACKER LIVE
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-1.5 font-mono mt-0.5 shrink-0">
              <div className="px-1 text-[10.5px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                APPLICATIONS
              </div>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = iconMap[item.icon];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`app-sidebar-nav-item flex items-center gap-2.5 border-[2px] border-black dark:border-white/40 px-3 py-2 font-bold transition-all shadow-[2px_2px_0_0_#000000] hover:bg-[#FFE600] hover:!text-black hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000000] active:translate-y-0.5 active:shadow-none ${
                      isActive
                        ? "bg-[#FFE600] !text-black shadow-[3px_3px_0_0_#000000] -translate-y-0.5 font-black"
                        : "bg-[var(--muted)] text-[var(--foreground)]"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "!text-black" : "text-current"}`} />
                    <span className="uppercase text-xs sm:text-[13px] font-bold">{item.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/notifications"
                prefetch={true}
                className={`app-sidebar-nav-item flex items-center gap-2.5 border-[2px] border-black dark:border-white/40 px-3 py-2 font-bold transition-all shadow-[2px_2px_0_0_#000000] hover:bg-[#FFE600] hover:!text-black hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000000] active:translate-y-0.5 active:shadow-none ${
                  pathname === "/notifications"
                    ? "bg-[#FFE600] !text-black shadow-[3px_3px_0_0_#000000] -translate-y-0.5 font-black"
                    : "bg-[var(--muted)] text-[var(--foreground)]"
                }`}
              >
                <BellIcon className={`h-4 w-4 shrink-0 ${pathname === "/notifications" ? "!text-black" : "text-current"}`} />
                <span className="uppercase text-xs sm:text-[13px] font-bold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto flex h-4 min-w-4 items-center justify-center border border-black bg-[#F43F5E] px-1 text-[9.5px] font-bold text-white shadow-[1px_1px_0_0_#000000]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/self-track"
                prefetch={true}
                className={`app-sidebar-nav-item flex items-center gap-2.5 border-[2px] border-black dark:border-white/40 px-3 py-2 font-bold transition-all shadow-[2px_2px_0_0_#000000] hover:bg-[#FFE600] hover:!text-black hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000000] active:translate-y-0.5 active:shadow-none ${
                  pathname === "/self-track"
                    ? "bg-[#FFE600] !text-black shadow-[3px_3px_0_0_#000000] -translate-y-0.5 font-black"
                    : "bg-[var(--muted)] text-[var(--foreground)]"
                }`}
              >
                <WalletIcon className={`h-4 w-4 shrink-0 ${pathname === "/self-track" ? "!text-black" : "text-current"}`} />
                <span className="uppercase text-xs sm:text-[13px] font-bold">Self Track</span>
                <span className="ml-auto text-[8.5px] px-1.5 py-0.5 border border-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 font-bold">
                  PRIVATE
                </span>
              </Link>
            </nav>
          </div>

          {/* User Account & Theme Toggle Footer */}
          <div className="flex flex-col gap-1.5 border-t-[2px] border-black dark:border-white/20 pt-2.5 font-mono shrink-0">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] uppercase font-bold text-gray-500">THEME</span>
              <ThemeToggle />
            </div>

            <Link
              href="/profile"
              prefetch={true}
              className="flex items-center gap-2.5 border-[2px] border-black bg-[var(--card)] p-1.5 text-[var(--foreground)] shadow-[2px_2px_0_0_#000000] transition-all hover:bg-[var(--accent)] hover:text-black dark:hover:bg-[var(--accent)] dark:hover:text-black hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000000] active:translate-y-0.5 active:shadow-none group"
            >
              <UserAvatar name={fullName} username={username} src={avatarUrl} size="sm" />
              <div className="overflow-hidden min-w-0">
                <span className="block truncate font-bold text-xs sm:text-[13px]">{fullName ?? ("@" + username)}</span>
                <span className="block text-[9px] text-[#059669] dark:text-[#2DD4BF] font-bold leading-none mt-0.5">ONLINE<span className="hidden sm:inline"> // AUTH</span></span>
              </div>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 border-[2px] border-black bg-white dark:bg-[#1E212D] px-2.5 py-1.5 text-left font-mono text-xs font-bold text-black dark:text-white shadow-[2px_2px_0_0_#000000] hover:bg-[#F43F5E] hover:text-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000000] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
              >
                <LogOutIcon className="h-3.5 w-3.5" />
                <span className="uppercase text-xs font-bold">Sign Out</span>
              </button>
            </form>
          </div>
        </aside>
      ) : (
        /* Collapsed Floating Re-Open Button for PC */
        <button
          type="button"
          onPointerDown={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            launcherDrag.current = {
              pointerId: event.pointerId,
              offsetX: event.clientX - rect.left,
              offsetY: event.clientY - rect.top,
              moved: false,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const drag = launcherDrag.current;
            if (!drag || drag.pointerId !== event.pointerId) return;
            const nextX = Math.max(8, Math.min(window.innerWidth - event.currentTarget.offsetWidth - 8, event.clientX - drag.offsetX));
            const nextY = Math.max(8, Math.min(window.innerHeight - event.currentTarget.offsetHeight - 8, event.clientY - drag.offsetY));
            if (Math.abs(nextX - launcherPosition.x) > 2 || Math.abs(nextY - launcherPosition.y) > 2) drag.moved = true;
            setLauncherPosition({ x: nextX, y: nextY });
          }}
          onPointerUp={(event) => {
            const drag = launcherDrag.current;
            launcherDrag.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
            if (!drag?.moved) setIsSidebarCollapsed(false);
          }}
          style={{ left: launcherPosition.x, top: launcherPosition.y, touchAction: "none" }}
          className="fixed z-50 hidden md:flex items-center gap-1.5 px-3 py-2 border-[2.5px] border-black bg-[#FFE600] text-black font-mono text-xs font-black shadow-[3px_3px_0_0_#000] hover:bg-yellow-300 cursor-grab active:cursor-grabbing uppercase transition-shadow"
          title="Expand Sidebar"
        >
          <Image
            src="/brand/flendly-symbol.svg"
            alt="Flendly"
            width={24}
            height={24}
            className="h-6 w-6 shrink-0"
          />
          <span>FLENDLY</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      )}

      {/* Spacer for fixed sidebar */}
      {!isSidebarCollapsed && <div className="hidden md:block w-64 lg:w-72 shrink-0" />}

      {/* Main Content Area */}
      <div className="relative z-10 flex min-h-screen flex-1 flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Header in Retro Style */}
        <header className="relative flex h-14 items-center justify-center border-b-[2px] border-[var(--border)] bg-[var(--background)] px-4 md:hidden sticky top-0 z-40">
          <Link href="/dashboard" className="flex items-center gap-2" prefetch={true}>
            <Image
              src="/brand/flendly-symbol.svg"
              alt="Flendly"
              width={40}
              height={40}
              priority
              className="h-10 w-10 shrink-0"
            />
            <span className="font-mono text-sm font-black tracking-wider text-black dark:text-white">FLENDLY</span>
          </Link>
        </header>

        <main className="flex-1 pb-20 md:pb-6 min-w-0">{children}</main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="app-mobile-nav fixed inset-x-0 bottom-0 z-30 flex h-16 gap-0.5 sm:gap-1 border-t-[2px] border-[var(--border)] bg-[var(--background)] px-1 py-1 shadow-[0_-3px_0_0_#000] md:hidden font-mono text-xs">
          {[
            { href: "/dashboard", label: "Dashboard", mobileLabel: "Dash", icon: "HomeIcon" },
            { href: "/lent", label: "Lent", mobileLabel: "Lent", icon: "ArrowUpIcon" },
            { href: "/borrowed", label: "Borrowed", mobileLabel: "Borrow", icon: "ArrowDownIcon" },
            { href: "/requests", label: "Requests", mobileLabel: "Reqs", icon: "InboxIcon" },
            { href: "/notifications", label: "Alerts", mobileLabel: "Alerts", icon: "BellIcon" },
            { href: "/self-track", label: "Ledger", mobileLabel: "Self", icon: "WalletIcon" },
            { href: "/profile", label: "Profile", mobileLabel: "Profile", icon: "UserIcon" },
          ].map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[4px] border-[1.5px] border-[var(--border)] px-0.5 py-1 transition-all active:scale-95 ${
                  isActive
                    ? "app-mobile-nav-active bg-[#FFE600] !text-black shadow-[2px_2px_0_0_#000] -translate-y-0.5 font-black"
                    : "app-mobile-nav-inactive bg-[var(--card)] text-[var(--foreground)] hover:bg-[#FFE600] hover:!text-black"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "!text-black" : "text-current"}`} />
                <span className={`w-full text-center truncate text-[8px] min-[380px]:text-[8.5px] font-black uppercase tracking-tighter leading-none ${isActive ? "!text-black" : "text-current"}`}>
                  {item.mobileLabel}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// Icon lookup map
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  HomeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  InboxIcon,
  BellIcon,
  WalletIcon,
  UserIcon,
};

type IconProps = { className?: string };

function WalletIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="18" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}

function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function InboxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path
        d="M4 12h4l2 3h4l2-3h4M4 12l1.5-6.5A2 2 0 0 1 7.44 4h9.12a2 2 0 0 1 1.94 1.5L20 12M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path
        d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="12" cy="8" r="4" fill="none" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function LogOutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

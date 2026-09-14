"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/lib/auth/actions";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/lent", label: "Lent", icon: ArrowUpIcon },
  { href: "/borrowed", label: "Borrowed", icon: ArrowDownIcon },
  { href: "/requests", label: "Requests", icon: InboxIcon },
];

export function AppShell({
  children,
  fullName,
  username,
  unreadCount = 0,
}: {
  children: React.ReactNode;
  fullName: string | null;
  username: string;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  return (
    <div className="relative flex min-h-screen w-full bg-[#FAF8F5] dark:bg-[#0F1117] text-black dark:text-slate-100 transition-colors">
      {/* Ambient Retro Geometric Grid Layer */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 opacity-[0.06] dark:opacity-[0.14] [background-image:radial-gradient(#000000_1.5px,transparent_1.5px),linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] dark:[background-image:radial-gradient(#ffffff_1px,transparent_1px),linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px,64px_64px,64px_64px]" 
      />

      {/* Retro OS Sidebar - Fixed / Sticky at full screen height, non-scrolling */}
      <aside className="relative z-20 hidden w-64 lg:w-72 shrink-0 flex-col justify-between border-r-[2.5px] border-black dark:border-[#3A3F55] bg-white dark:bg-[#161821] px-4 py-4 md:flex shadow-[4px_0_0_0_#000000] dark:shadow-[4px_0_0_0_rgba(0,0,0,0.5)] sticky top-0 h-screen select-none">
        <div className="flex flex-col gap-3">
          {/* Retro Window Title / Logo */}
          <div className="px-1">
            <div className="flex items-center justify-between mb-2.5 border-b-[2px] border-black dark:border-white/20 pb-1.5">
              <span className="font-mono text-xs font-bold text-black dark:text-white uppercase tracking-wider">FLENDLY</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-[#FFE600] border border-black inline-block text-[9px] font-bold text-center leading-none select-none">▲</span>
                <span className="w-3.5 h-3.5 bg-[#F43F5E] border border-black inline-block text-[9px] font-bold text-center text-white leading-none select-none">✕</span>
              </div>
            </div>
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-8.5 w-8.5 items-center justify-center border-[2px] border-black bg-[#FFE600] font-mono text-base font-black text-black shadow-[2px_2px_0_0_#000000]">
                ⚡
              </div>
              <div>
                <span className="font-mono text-base lg:text-lg font-black tracking-tight text-black dark:text-white block leading-none">
                  FLENDLY
                </span>
                <span className="font-mono text-[9px] uppercase font-bold text-[#2563EB] dark:text-[#60A5FA] block mt-0.5 tracking-wider">
                  PEER LEDGER REALTIME
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Menu with Stitch Neo-Brutalist Buttons */}
          <nav className="flex flex-col gap-1.5 font-mono mt-0.5">
            <div className="px-1 text-[10.5px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
              APPLICATIONS
            </div>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] px-3 py-2 font-bold text-black dark:text-white transition-all shadow-[2px_2px_0_0_#000000] hover:bg-[#FFE600] hover:text-black hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000000] active:translate-y-0.5 active:shadow-none"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="uppercase text-xs sm:text-[13px] font-bold">{item.label}</span>
              </Link>
            ))}
            <Link
              href="/notifications"
              className="flex items-center gap-2.5 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] px-3 py-2 font-bold text-black dark:text-white transition-all shadow-[2px_2px_0_0_#000000] hover:bg-[#FFE600] hover:text-black hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000000] active:translate-y-0.5 active:shadow-none"
            >
              <BellIcon className="h-4 w-4 shrink-0" />
              <span className="uppercase text-xs sm:text-[13px] font-bold">Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-auto flex h-4 min-w-4 items-center justify-center border border-black bg-[#F43F5E] px-1 text-[9.5px] font-bold text-white shadow-[1px_1px_0_0_#000000]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/self-track"
              className="flex items-center gap-2.5 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] px-3 py-2 font-bold text-black dark:text-white transition-all shadow-[2px_2px_0_0_#000000] hover:bg-[#FFE600] hover:text-black hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000000] active:translate-y-0.5 active:shadow-none"
            >
              <WalletIcon className="h-4 w-4 shrink-0" />
              <span className="uppercase text-xs sm:text-[13px] font-bold">Self Track</span>
              <span className="ml-auto text-[8.5px] px-1.5 py-0.2 border border-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 font-bold">
                PRIV
              </span>
            </Link>
          </nav>
        </div>

        {/* User Account & Theme Toggle Footer (Fixed at Left Corner Bottom for all pages) */}
        <div className="flex flex-col gap-1.5 border-t-[2px] border-black dark:border-white/20 pt-2.5 font-mono mt-auto shrink-0">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-bold text-gray-500">THEME</span>
            <ThemeToggle />
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-2.5 border-[2px] border-black bg-white dark:bg-[#1E212D] p-1.5 text-black dark:text-white shadow-[2px_2px_0_0_#000000] transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000000] active:translate-y-0.5 active:shadow-none"
          >
            <div className="h-6.5 w-6.5 border border-black bg-[#2563EB] flex items-center justify-center text-white shrink-0">
              <UserIcon className="h-3.5 w-3.5" />
            </div>
            <div className="overflow-hidden min-w-0">
              <span className="block truncate font-bold text-xs sm:text-[13px]">{fullName ?? ("@" + username)}</span>
              <span className="block text-[9px] text-[#059669] dark:text-[#2DD4BF] font-bold leading-none mt-0.5">ONLINE // AUTH</span>
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

      {/* Main Content Area */}
      <div className="relative z-10 flex min-h-screen flex-1 flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Header in Retro Style */}
        <header className="flex items-center justify-between border-b-[2px] border-black dark:border-white/40 bg-[#F5F2EB] dark:bg-[#161821] px-4 py-2.5 md:hidden sticky top-0 z-40">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center border-[2px] border-black bg-[#FFE600] font-mono text-xs font-black text-black shadow-[1px_1px_0_0_#000]">
              ⚡
            </div>
            <span className="font-mono text-sm font-bold tracking-wider text-black dark:text-white">FLENDLY</span>
          </Link>
        </header>

        <main className="flex-1 pb-20 md:pb-6 min-w-0">{children}</main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t-[2px] border-black bg-white dark:bg-[#161821] md:hidden font-mono text-xs">
          {[
            ...NAV_ITEMS,
            { href: "/notifications", label: "Alerts", icon: BellIcon },
            { href: "/self-track", label: "Ledger", icon: WalletIcon },
            { href: "/profile", label: "Profile", icon: UserIcon },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-2 text-black dark:text-gray-300 hover:bg-[#FFE600] hover:text-black font-bold border-r last:border-r-0 border-black/10 dark:border-white/10"
            >
              <item.icon className="h-4 w-4" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

type IconProps = { className?: string };

function WalletIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}

function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
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
      />
    </svg>
  );
}

function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" strokeLinejoin="round" />
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
      />
    </svg>
  );
}

import Link from "next/link";

import { signOut } from "@/lib/auth/actions";
import { getUnreadCount } from "@/lib/notifications/queries";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/lent", label: "Lent", icon: ArrowUpIcon },
  { href: "/borrowed", label: "Borrowed", icon: ArrowDownIcon },
  { href: "/requests", label: "Requests", icon: InboxIcon },
];

export async function AppShell({
  children,
  fullName,
  username,
}: {
  children: React.ReactNode;
  fullName: string | null;
  username: string;
}) {
  const unread = await getUnreadCount();

  return (
    <div className="flex min-h-screen w-full bg-[#FAF8F5] dark:bg-[#0F1117] text-black dark:text-slate-100 transition-colors">
      {/* Retro OS Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r-[2.5px] border-black dark:border-[#3A3F55] bg-white dark:bg-[#161821] px-4 py-5 md:flex shadow-[4px_0_0_0_#000000] dark:shadow-[4px_0_0_0_rgba(0,0,0,0.5)]">
        {/* Retro Window Title / Logo */}
        <div className="mb-6 px-2">
          <div className="flex items-center justify-between mb-3 border-b-[2px] border-black dark:border-white/20 pb-2">
            <span className="font-mono text-[11px] font-bold text-black dark:text-white uppercase tracking-wider">FLENDLY_OS // v2.4</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#FFE600] border border-black inline-block text-[8px] font-bold text-center leading-none">▲</span>
              <span className="w-3 h-3 bg-[#F43F5E] border border-black inline-block text-[8px] font-bold text-center text-white leading-none">✕</span>
            </div>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center border-[2px] border-black bg-[#FFE600] font-mono text-base font-black text-black shadow-[2px_2px_0_0_#000000]">
              ⚡
            </div>
            <div>
              <span className="font-mono text-lg font-black tracking-tight text-black dark:text-white block">
                FLENDLY OS
              </span>
              <span className="font-mono text-[9px] uppercase font-bold text-[#2563EB] dark:text-[#60A5FA] block">
                PEER LEDGER REALTIME
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu with Stitch Neo-Brutalist Buttons */}
        <nav className="flex flex-1 flex-col gap-2 font-mono text-xs">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
            APPLICATIONS
          </div>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] px-3 py-2 font-bold text-black dark:text-white transition-all shadow-[2px_2px_0_0_#000000] hover:bg-[#FFE600] hover:text-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              <item.icon className="h-4 w-4" />
              <span className="uppercase">{item.label}</span>
            </Link>
          ))}
          <Link
            href="/notifications"
            className="flex items-center gap-3 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] px-3 py-2 font-bold text-black dark:text-white transition-all shadow-[2px_2px_0_0_#000000] hover:bg-[#FFE600] hover:text-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <BellIcon className="h-4 w-4" />
            <span className="uppercase">Notifications</span>
            {unread > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center border border-black bg-[#F43F5E] px-1 text-[10px] font-bold text-white shadow-[1px_1px_0_0_#000000]">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <Link
            href="/self-track"
            className="flex items-center gap-3 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] px-3 py-2 font-bold text-black dark:text-white transition-all shadow-[2px_2px_0_0_#000000] hover:bg-[#FFE600] hover:text-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <WalletIcon className="h-4 w-4" />
            <span className="uppercase">Self Track</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 border border-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 font-bold">
              PRIV
            </span>
          </Link>
        </nav>

        {/* User Account / Footer in Retro Window Style */}
        <div className="mt-auto flex flex-col gap-2 border-t-[2px] border-black dark:border-white/20 pt-4 font-mono text-xs">
          <Link
            href="/profile"
            className="flex items-center gap-3 border-[2px] border-black bg-white dark:bg-[#1E212D] p-2 text-black dark:text-white shadow-[2px_2px_0_0_#000000] transition-all hover:bg-gray-100"
          >
            <div className="h-7 w-7 border border-black bg-[#2563EB] flex items-center justify-center text-white">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <span className="block truncate font-bold">{fullName ?? `@${username}`}</span>
              <span className="block text-[10px] text-[#059669] dark:text-[#2DD4BF] font-bold">ONLINE // AUTH</span>
            </div>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 border-[2px] border-black bg-white dark:bg-[#1E212D] px-3 py-2 text-left font-mono text-xs font-bold text-black dark:text-white shadow-[2px_2px_0_0_#000000] hover:bg-[#F43F5E] hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all"
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="uppercase">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile Header in Retro Style */}
        <header className="flex items-center justify-between border-b border-[#1E2935] bg-[#0E141D] px-4 py-3 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="h-2 w-2 rounded-full bg-[#FF5F56]" />
              <span className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
              <span className="h-2 w-2 rounded-full bg-[#27C93F]" />
            </div>
            <span className="font-mono text-sm font-bold tracking-wider text-teal-400">FLENDLY.OS</span>
          </Link>
          <Link href="/notifications" className="relative rounded-lg p-2 bg-[#161F2B] border border-[#1E2935] text-slate-300 hover:text-white">
            <BellIcon className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            )}
          </Link>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-[#1E2935] bg-[#0E141D]/95 backdrop-blur-md md:hidden font-mono text-[10px]">
          {[
            ...NAV_ITEMS,
            { href: "/notifications", label: "Alerts", icon: BellIcon },
            { href: "/self-track", label: "Ledger", icon: WalletIcon },
            { href: "/profile", label: "Profile", icon: UserIcon },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-2 text-slate-400 hover:text-teal-300"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
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

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
    <div className="flex min-h-screen w-full bg-[#080C11] bg-retro-grid text-slate-100">
      {/* Retro OS Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#1E2935] bg-[#0E141D]/95 px-4 py-5 md:flex shadow-2xl">
        {/* Retro Window Title / Logo */}
        <div className="mb-6 px-2">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
            <span className="ml-2 font-mono text-[10px] text-slate-500">SYS.NAV // v1.0</span>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-400 font-mono text-sm font-bold text-slate-950 retro-raised shadow-md shadow-teal-500/20">
              F
            </div>
            <div>
              <span className="font-mono text-lg font-bold tracking-wider text-white block">
                FLENDLY
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu with Retro Buttons */}
        <nav className="flex flex-1 flex-col gap-1.5 font-mono text-xs">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Applications
          </div>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-slate-400 transition-all duration-150 hover:bg-[#161F2B] hover:text-teal-300 hover:border-teal-500/30 border border-transparent"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
          <Link
            href="/notifications"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-slate-400 transition-all duration-150 hover:bg-[#161F2B] hover:text-teal-300 hover:border-teal-500/30 border border-transparent"
          >
            <BellIcon className="h-4 w-4" />
            <span>Notifications</span>
            {unread > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-md bg-teal-400 px-1 text-[10px] font-bold text-slate-950">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <Link
            href="/self-track"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-slate-400 transition-all duration-150 hover:bg-[#161F2B] hover:text-teal-300 hover:border-teal-500/30 border border-transparent"
          >
            <WalletIcon className="h-4 w-4" />
            <span>Self Track</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              PRIV
            </span>
          </Link>
        </nav>

        {/* User Account / Footer in Retro Window Style */}
        <div className="mt-auto flex flex-col gap-2 border-t border-[#1E2935] pt-4 font-mono text-xs">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl p-2.5 text-slate-300 transition-all hover:bg-[#161F2B] hover:text-white border border-transparent hover:border-white/10"
          >
            <div className="h-7 w-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <span className="block truncate font-bold">{fullName ?? `@${username}`}</span>
              <span className="block text-[10px] text-teal-400/80">ONLINE // AUTH</span>
            </div>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-mono text-xs text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-300 border border-transparent cursor-pointer"
            >
              <LogOutIcon className="h-4 w-4" />
              <span>Sign Out</span>
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

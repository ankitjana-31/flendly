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
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 md:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold text-primary-foreground">
            F
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">Flendly</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          <Link
            href="/notifications"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <BellIcon className="h-5 w-5" />
            Notifications
            {unread > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-xs font-semibold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <UserIcon className="h-5 w-5" />
            <span className="truncate">{fullName ?? `@${username}`}</span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOutIcon className="h-5 w-5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-heading text-xs font-bold text-primary-foreground">
              F
            </div>
            <span className="font-heading text-lg font-bold">Flendly</span>
          </Link>
          <Link href="/notifications" className="relative rounded-full p-2 hover:bg-muted">
            <BellIcon className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-danger" />
            )}
          </Link>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-card md:hidden">
          {[...NAV_ITEMS, { href: "/profile", label: "Profile", icon: UserIcon }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

type IconProps = { className?: string };

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

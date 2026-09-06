"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AuthedShellProps {
  children: React.ReactNode;
  profile: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  unreadCount?: number;
}

export function AuthedShell({ children, profile, unreadCount = 0 }: AuthedShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Lent", href: "/lent", icon: ArrowUpRight },
    { name: "Borrowed", href: "/borrowed", icon: ArrowDownLeft },
    { name: "Requests", href: "/requests", icon: MessageSquare },
    { name: "Self Track", href: "/self-track", icon: Wallet },
  ];

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    signOut();
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#121316] text-[#111318] dark:text-[#F3F4F6] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#1A1C23]/80 backdrop-blur border-b border-zinc-200/50 dark:border-zinc-800/50 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Flendly
            </span>
            {/* Live Sync pulsing indicator */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Settings Link */}
          <Link
            href="/profile/settings"
            title="Settings"
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>

          {/* Notification Bell */}
          <Link
            href="/notifications"
            className="relative p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#1A1C23]">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* User profile dropdown pill */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "User"}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs font-semibold uppercase">
                  {profile?.username?.substring(0, 2) || "U"}
                </div>
              )}
              <span className="hidden sm:inline text-xs font-medium px-1 pr-2 text-zinc-700 dark:text-zinc-300">
                @{profile?.username || "user"}
              </span>
            </button>

            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-[#1A1C23] border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 py-1">
                  <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {profile?.full_name || "User"}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      @{profile?.username}
                    </p>
                  </div>
                  <Link
                    href="/profile/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <form onSubmit={handleSignOut}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1A1C23] py-2 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Always pinned at bottom for viewports < 768px) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1A1C23] border-t border-zinc-200/50 dark:border-zinc-800/50 flex md:hidden items-center justify-around h-16 z-40 px-4 backdrop-blur">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full text-center transition-colors ${
                isActive
                  ? "text-zinc-950 dark:text-white font-semibold"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
        <Link
          href="/profile/settings"
          className={`flex flex-col items-center justify-center flex-1 h-full text-center transition-colors ${
            pathname.startsWith("/profile")
              ? "text-zinc-950 dark:text-white font-semibold"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          <User className="h-5 w-5 mb-1" />
          <span className="text-[10px]">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

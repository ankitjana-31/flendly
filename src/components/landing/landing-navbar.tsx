"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Shield, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.08] bg-[#0B0F14]/75 backdrop-blur-xl py-3.5 shadow-lg shadow-black/20"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 font-brand text-base font-black text-[#0B0F14] shadow-md shadow-teal-500/20 transition-transform group-hover:scale-105">
            F
          </div>
          <span className="font-brand text-xl font-extrabold tracking-tight text-slate-100">
            FLENDLY
          </span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a
            href="#story"
            className="transition-colors hover:text-teal-400"
          >
            The Handshake
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-teal-400"
          >
            How It Works
          </a>
          <a
            href="#lenders"
            className="transition-colors hover:text-teal-400"
          >
            For Lenders
          </a>
          <a
            href="#borrowers"
            className="transition-colors hover:text-teal-400"
          >
            For Borrowers
          </a>
          <a
            href="#network"
            className="transition-colors hover:text-teal-400"
          >
            Network
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3.5">
          <ThemeToggle />

          <Link
            href="/auth/login"
            className="hidden sm:inline-flex text-xs font-semibold text-slate-300 transition-colors hover:text-white px-3 py-2"
          >
            Sign In
          </Link>

          <Link
            href="/auth/login"
            className="relative group inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-teal-400 px-4 py-2 text-xs font-bold text-[#0B0F14] transition-all hover:bg-teal-300 hover:shadow-lg hover:shadow-teal-400/25"
          >
            <span>Get Started</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
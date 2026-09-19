import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 font-mono text-xs sm:text-sm font-bold rounded-[4px] border-[2px] border-black dark:border-white shadow-[3px_3px_0_0_#000000] dark:shadow-[3px_3px_0_0_#2563EB] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000000] dark:hover:shadow-[4px_4px_0_0_#2563EB] active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000000] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer select-none";

const variants = {
  primary: "bg-[#FFE600] text-black hover:bg-yellow-300",
  secondary: "bg-[#2563EB] text-white hover:bg-blue-600",
  outline: "bg-white dark:bg-[var(--muted)] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
  ghost: "border-transparent shadow-none bg-transparent text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 hover:shadow-none hover:translate-y-0",
  danger: "bg-[#F43F5E] text-white hover:bg-rose-600",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-xs sm:text-sm",
  lg: "h-12 px-6 text-sm sm:text-base",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </Link>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border border-border bg-card ${className}`}>{children}</div>
  );
}

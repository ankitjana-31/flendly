import { redirect } from "next/navigation";
import Link from "next/link";

import { signInWithGoogle } from "@/lib/auth/actions";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { LoginContent } from "@/components/auth/login-content";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CursorGlow } from "@/components/ui/cursor-glow";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  let user = null;
  let profile = null;

  try {
    const res = await getCurrentUserProfile();
    user = res.user;
    profile = res.profile;
  } catch (e) {
    console.error("Error fetching user profile:", e);
  }

  if (user && isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4 transition-colors duration-200">
      {/* Ambient Retro Geometric Grid Layer */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.16] [background-image:radial-gradient(#000000_1.5px,transparent_1.5px),linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] dark:[background-image:radial-gradient(#ffffff_1px,transparent_1px),linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px,64px_64px,64px_64px]" 
      />

      {/* Reactive Cursor Glow (Luminous in Light & Dark Mode) */}
      <CursorGlow />

      <div className="absolute top-5 left-5 z-30 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[var(--foreground)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-[var(--primary-foreground)] bg-[var(--card)] px-3.5 py-1.5 border-[2px] border-[var(--border)] shadow-[3px_3px_0_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <span aria-hidden className="text-[#2563EB] dark:text-[#60A5FA]">◄</span> [ESC] BACK TO HOME
        </Link>
      </div>

      <div className="absolute top-5 right-5 z-30">
        <ThemeToggle />
      </div>

      {/* Central Login Card */}
      <LoginContent error={error} />
    </div>
  );
}

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

  if (user && !isPlaceholderUsername(profile?.username)) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] px-4 py-6 sm:py-10 transition-colors duration-200">
      {/* Ambient Retro Geometric Grid Layer */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.16] [background-image:radial-gradient(#000000_1.5px,transparent_1.5px),linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] dark:[background-image:radial-gradient(#ffffff_1px,transparent_1px),linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px,64px_64px,64px_64px]" 
      />

      {/* Reactive Cursor Glow (Luminous in Light & Dark Mode) */}
      <CursorGlow />

      {/* Top Safe Navigation Bar directly above the window */}
      <div className="relative z-30 w-full max-w-md flex items-center justify-between mb-3.5 px-0.5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[var(--foreground)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-black bg-[var(--card)] px-3.5 py-1.5 rounded-[4px] border-[2px] border-[var(--border)] shadow-[3px_3px_0_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <span aria-hidden className="text-[#2563EB] dark:text-[#60A5FA]">◄</span> [ESC] BACK TO HOME
        </Link>
        <ThemeToggle />
      </div>

      {/* Central Login Card */}
      <LoginContent error={error} />
    </main>
  );
}

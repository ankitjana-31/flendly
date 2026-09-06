import { redirect } from "next/navigation";
import Link from "next/link";

import { signInWithGoogle } from "@/lib/auth/actions";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { GoogleSignInButton } from "@/components/users/google-sign-in-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LoginSparklesBackground } from "@/components/auth/login-sparkles-background";
import { BorderBeam } from "@/components/ui/border-beam";
import { LoginContent } from "@/components/auth/login-content";

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12">
      {/* Dynamic Sparkles & Particle Background */}
      <LoginSparklesBackground />

      {/* Top Navigation / Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-white"
        >
          <span aria-hidden>←</span> Back to home
        </Link>
      </div>

      {/* Central Login Card */}
      <LoginContent error={error} />
    </main>
  );
}

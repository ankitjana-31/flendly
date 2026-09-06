import { redirect } from "next/navigation";
import Link from "next/link";

import { signInWithGoogle } from "@/lib/auth/actions";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { GoogleSignInButton } from "@/components/users/google-sign-in-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BorderBeam } from "@/components/ui/border-beam";
import { LoginContent } from "@/components/auth/login-content";
import { BeamsBackground } from "@/components/ui/beams-background";

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
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center bg-background dark:bg-[#0B0F14]">
      {/* Animated Beams Background - Fixed to entire screen */}
      <BeamsBackground intensity="medium" className="fixed inset-0 h-screen w-screen overflow-hidden flex items-center justify-center p-4">
        {/* Top Navigation / Theme Toggle */}
        <div className="absolute top-5 right-5 z-30">
          <ThemeToggle />
        </div>

        <div className="absolute top-5 left-5 z-30">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/70 transition-colors hover:text-foreground bg-card/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border/60 shadow-sm"
          >
            <span aria-hidden>←</span> Back to home
          </Link>
        </div>

        {/* Central Login Card */}
        <LoginContent error={error} />
      </BeamsBackground>
    </div>
  );
}

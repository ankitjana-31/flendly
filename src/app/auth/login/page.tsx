import { redirect } from "next/navigation";
import Link from "next/link";

import { signInWithGoogle } from "@/lib/auth/actions";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
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
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center bg-[#0B0F14] text-white">
      {/* Animated Beams Background - Fixed to entire screen */}
      <BeamsBackground intensity="medium" className="fixed inset-0 h-screen w-screen overflow-hidden flex items-center justify-center p-4 bg-[#0B0F14]">
        <div className="absolute top-6 left-6 z-30">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs font-medium text-slate-300 transition-all duration-200 hover:text-white hover:border-teal-400/50 bg-[#121822]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 retro-raised"
          >
            <span aria-hidden className="text-teal-400">◄</span> [ESC] Back to Home
          </Link>
        </div>

        {/* Central Login Card */}
        <LoginContent error={error} />
      </BeamsBackground>
    </div>
  );
}

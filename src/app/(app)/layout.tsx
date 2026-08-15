import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  return (
    <AppShell fullName={profile?.full_name ?? null} username={profile?.username ?? ""}>
      {children}
    </AppShell>
  );
}

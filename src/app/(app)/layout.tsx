import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { getUnreadCount } from "@/lib/notifications/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  const unread = await getUnreadCount();

  return (
    <AppShell
      fullName={profile?.full_name ?? null}
      username={profile?.username ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
      unreadCount={unread}
    >
      {children}
    </AppShell>
  );
}

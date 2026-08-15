import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { getCurrentUserProfile } from "@/lib/auth/queries";

export default async function ProfilePage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 font-heading text-xl font-bold text-accent">
          {(profile?.full_name ?? profile?.username ?? "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold">{profile?.full_name ?? `@${profile?.username}`}</h1>
          <p className="text-sm text-muted-foreground">@{profile?.username}</p>
        </div>
      </div>

      <Card className="flex flex-col divide-y divide-border">
        <Link
          href="/profile/settings"
          className="flex items-center justify-between px-4 py-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Privacy &amp; account settings
          <span className="text-muted-foreground">›</span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-medium text-danger transition-colors hover:bg-muted"
          >
            Sign out
          </button>
        </form>
      </Card>
    </div>
  );
}

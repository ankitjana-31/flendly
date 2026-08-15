import { redirect } from "next/navigation";

import { Card } from "@/components/ui/button";
import { ChangeUsernameForm } from "@/components/users/change-username-form";
import { PrivacySettingsForm } from "@/components/users/privacy-settings-form";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";

export default async function ProfileSettingsPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();
  const { data: privacy } = await supabase
    .from("privacy_settings")
    .select("avatar_visibility, email_visibility, phone_visibility")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 md:px-8">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>

      <Card className="flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Username</h2>
        <ChangeUsernameForm
          currentUsername={profile?.username ?? ""}
          changesUsed={profile?.username_changed_count ?? 0}
        />
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Privacy</h2>
        <PrivacySettingsForm
          avatarVisibility={privacy?.avatar_visibility ?? "participants"}
          emailVisibility={privacy?.email_visibility ?? "only_me"}
          phoneVisibility={privacy?.phone_visibility ?? "only_me"}
        />
      </Card>
    </div>
  );
}

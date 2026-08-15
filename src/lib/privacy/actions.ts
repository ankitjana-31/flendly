"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const privacySchema = z.object({
  avatarVisibility: z.enum(["everyone", "participants", "nobody"]),
  emailVisibility: z.enum(["only_me", "participants"]),
  phoneVisibility: z.enum(["only_me", "participants"]),
});

export type PrivacyActionState = { error?: string; success?: boolean };

export async function updatePrivacySettingsAction(
  _prev: PrivacyActionState,
  formData: FormData,
): Promise<PrivacyActionState> {
  const parsed = privacySchema.safeParse({
    avatarVisibility: formData.get("avatarVisibility"),
    emailVisibility: formData.get("emailVisibility"),
    phoneVisibility: formData.get("phoneVisibility"),
  });

  if (!parsed.success) return { error: "Invalid privacy settings." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { error } = await supabase
    .from("privacy_settings")
    .update({
      avatar_visibility: parsed.data.avatarVisibility,
      email_visibility: parsed.data.emailVisibility,
      phone_visibility: parsed.data.phoneVisibility,
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile/settings");
  return { success: true };
}

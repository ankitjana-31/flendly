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

const profileDetailsSchema = z.object({
  fullName: z.string().trim().max(100).optional(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9+()\-\s]{6,20}$/, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
});

export type ProfileDetailsState = { error?: string; success?: boolean };

export async function updateProfileDetailsAction(
  _prev: ProfileDetailsState,
  formData: FormData,
): Promise<ProfileDetailsState> {
  const parsed = profileDetailsSchema.safeParse({
    fullName: formData.get("fullName") || undefined,
    phoneNumber: formData.get("phoneNumber") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const fullNameVal = parsed.data.fullName || null;
  const phoneVal = parsed.data.phoneNumber || null;

  const { error: rpcError } = await supabase.rpc("update_profile_details", {
    p_full_name: fullNameVal,
    p_phone_number: phoneVal,
  });

  if (rpcError) {
    if (rpcError.message.includes("schema cache") || rpcError.code === "PGRST202") {
      // Fallback to direct profiles table update
      const { error: directErr } = await supabase
        .from("profiles")
        .update({
          full_name: fullNameVal,
          phone_number: phoneVal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (directErr) return { error: directErr.message };
    } else {
      return { error: rpcError.message };
    }
  }

  revalidatePath("/profile/settings");
  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: true };
}

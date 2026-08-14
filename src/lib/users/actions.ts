"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/, {
    message:
      "Use 3-20 characters: lowercase letters, numbers, and underscores.",
  });

export type UsernameFormState = {
  error?: string;
};

export async function completeUsername(
  _state: UsernameFormState,
  formData: FormData,
): Promise<UsernameFormState> {
  const parsed = usernameSchema.safeParse(formData.get("username"));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid username." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_username", {
    p_new_username: parsed.data,
  });

  if (error) {
    if (
      error.code === "23505" ||
      error.message.toLowerCase().includes("duplicate")
    ) {
      return { error: "That username is already taken." };
    }

    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export type ProfileFormState = {
  error?: string;
  success?: boolean;
};

export async function updateProfile(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const fullName = formData.get("fullName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone_number: phoneNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export type PrivacyFormState = {
  error?: string;
  success?: boolean;
};

export async function updatePrivacy(
  _state: PrivacyFormState,
  formData: FormData,
): Promise<PrivacyFormState> {
  const avatarVisibility = formData.get("avatarVisibility") as any;
  const emailVisibility = formData.get("emailVisibility") as any;
  const phoneVisibility = formData.get("phoneVisibility") as any;

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("privacy_settings")
    .update({
      avatar_visibility: avatarVisibility,
      email_visibility: emailVisibility,
      phone_visibility: phoneVisibility,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function changeUsername(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const username = formData.get("username") as string;
  const parsed = usernameSchema.safeParse(username);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid username." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_username", {
    p_new_username: parsed.data,
  });

  if (error) {
    if (
      error.code === "23505" ||
      error.message.toLowerCase().includes("duplicate")
    ) {
      return { error: "That username is already taken." };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}



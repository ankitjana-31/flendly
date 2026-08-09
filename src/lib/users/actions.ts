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

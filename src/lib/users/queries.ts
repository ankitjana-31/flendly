import { createClient } from "@/lib/supabase/server";
import type { VisibleProfile } from "@/lib/types";

export async function getVisibleProfile(targetId: string): Promise<VisibleProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_profile_visible", {
    target_id: targetId,
  });

  if (error) {
    console.error("Error fetching visible profile:", error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0] as VisibleProfile;
}

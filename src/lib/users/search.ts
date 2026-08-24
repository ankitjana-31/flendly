import { createClient } from "@/lib/supabase/client";

export async function searchUsers(query: string, limit = 10) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("search_users", {
    p_query: query,
    p_limit: limit,
  });

  if (error) {
    console.error("Error running search_users RPC:", error);
    throw error;
  }

  return data || [];
}

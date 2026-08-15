import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_users", {
    p_query: query,
    p_limit: 8,
  });

  if (error) {
    return NextResponse.json({ results: [], error: error.message }, { status: 400 });
  }

  return NextResponse.json({ results: data ?? [] });
}

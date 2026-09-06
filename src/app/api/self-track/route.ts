import { getCurrentUserProfile } from "@/lib/auth/queries";
import { listSelfTracks } from "@/lib/self-track/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { user } = await getCurrentUserProfile();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tracks = await listSelfTracks(user.id);
    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error fetching self tracks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

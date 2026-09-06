"use client";

import { SelfTrackWithPayments } from "@/lib/types/self-track";

export async function clientListSelfTracks(userId: string): Promise<SelfTrackWithPayments[]> {
  try {
    const response = await fetch(`/api/self-track?userId=${userId}`);
    if (!response.ok) {
      console.error("Failed to fetch self tracks");
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching self tracks:", error);
    return [];
  }
}

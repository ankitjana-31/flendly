"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SelfTrackType, SelfTrackStatus } from "@/lib/types/self-track";

type SelfTrackInsert = {
  user_id: string;
  type: SelfTrackType;
  person_name: string;
  amount: number;
  record_date: string;
  note: string | null;
  status: "active";
};

type SelfTrackPaymentInsert = {
  self_track_id: string;
  amount: number;
  payment_date: string;
  note: string | null;
};

export type SelfTrackActionResult = {
  success: boolean;
  error?: string;
  data?: any;
};

export async function createSelfTrack(data: {
  type: SelfTrackType;
  person_name: string;
  amount: number;
  record_date: string;
  note?: string;
}): Promise<SelfTrackActionResult> {
  try {
    const supabase = await createClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData.user) {
      return { success: false, error: "Authentication required. Please sign in again." };
    }

    const insertData: SelfTrackInsert = {
      user_id: userData.user.id,
      type: data.type,
      person_name: data.person_name,
      amount: data.amount,
      record_date: data.record_date,
      note: data.note || null,
      status: "active",
    };

    const { data: record, error } = await supabase
      .from("self_track")
      .insert([insertData] as never)
      .select()
      .single();

    if (error) {
      console.error("Supabase self_track insert error:", error);
      return { 
        success: false, 
        error: error.message.includes("does not exist") || error.code === "42P01"
          ? "The self_track table has not been created yet in Supabase. Please run migration 0022."
          : `Failed to create record: ${error.message}` 
      };
    }

    revalidatePath("/self-track");
    return { success: true, data: record };
  } catch (err) {
    console.error("createSelfTrack exception:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "An unexpected error occurred while saving." 
    };
  }
}

export async function addSelfTrackPayment(data: {
  self_track_id: string;
  amount: number;
  payment_date: string;
  note?: string;
}): Promise<SelfTrackActionResult> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return { success: false, error: "Authentication required." };
    }

    // Verify ownership
    const { data: record, error: recordError } = await supabase
      .from("self_track")
      .select("user_id")
      .eq("id", data.self_track_id)
      .single();

    if (recordError || !record || (record as any).user_id !== userData.user.id) {
      return { success: false, error: "Unauthorized or record not found." };
    }

    const insertData: SelfTrackPaymentInsert = {
      self_track_id: data.self_track_id,
      amount: data.amount,
      payment_date: data.payment_date,
      note: data.note || null,
    };

    const { data: payment, error } = await supabase
      .from("self_track_payments")
      .insert([insertData] as never)
      .select()
      .single();

    if (error) {
      return { success: false, error: `Failed to record payment: ${error.message}` };
    }

    revalidatePath("/self-track");
    return { success: true, data: payment };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to record payment." };
  }
}

export async function updateSelfTrackStatus(recordId: string, status: SelfTrackStatus): Promise<SelfTrackActionResult> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return { success: false, error: "Authentication required." };
    }

    // Verify ownership
    const { data: record, error: recordError } = await supabase
      .from("self_track")
      .select("user_id")
      .eq("id", recordId)
      .single();

    if (recordError || !record || (record as any).user_id !== userData.user.id) {
      return { success: false, error: "Unauthorized." };
    }

    const { data: updated, error } = await supabase
      .from("self_track")
      .update({ status, updated_at: new Date().toISOString() } as never)
      .eq("id", recordId)
      .select()
      .single();

    if (error) {
      return { success: false, error: `Failed to update status: ${error.message}` };
    }

    revalidatePath("/self-track");
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update status." };
  }
}

export async function deleteSelfTrack(recordId: string): Promise<SelfTrackActionResult> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return { success: false, error: "Authentication required." };
    }

    // Verify ownership
    const { data: record, error: recordError } = await supabase
      .from("self_track")
      .select("user_id")
      .eq("id", recordId)
      .single();

    if (recordError || !record || (record as any).user_id !== userData.user.id) {
      return { success: false, error: "Unauthorized." };
    }

    const { error } = await supabase.from("self_track").delete().eq("id", recordId);

    if (error) {
      return { success: false, error: `Failed to delete self track: ${error.message}` };
    }

    revalidatePath("/self-track");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete record." };
  }
}

export async function deleteSelfTrackPayment(paymentId: string, recordId: string): Promise<SelfTrackActionResult> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return { success: false, error: "Authentication required." };
    }

    // Verify ownership
    const { data: record, error: recordError } = await supabase
      .from("self_track")
      .select("user_id")
      .eq("id", recordId)
      .single();

    if (recordError || !record || (record as any).user_id !== userData.user.id) {
      return { success: false, error: "Unauthorized." };
    }

    const { error } = await supabase.from("self_track_payments").delete().eq("id", paymentId);

    if (error) {
      return { success: false, error: `Failed to delete payment: ${error.message}` };
    }

    revalidatePath("/self-track");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete payment." };
  }
}

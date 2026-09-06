"use server";

import { createClient } from "@/lib/supabase/server";
import { SelfTrackType, SelfTrackStatus } from "@/lib/types/self-track";

// Type overload for self_track table which hasn't been regenerated yet
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

export async function createSelfTrack(data: {
  type: SelfTrackType;
  person_name: string;
  amount: number;
  record_date: string;
  note?: string;
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    throw new Error("Authentication required");
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
    throw new Error(`Failed to create self track: ${error.message}`);
  }

  return record;
}

export async function addSelfTrackPayment(data: {
  self_track_id: string;
  amount: number;
  payment_date: string;
  note?: string;
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    throw new Error("Authentication required");
  }

  // Verify ownership
  const { data: record, error: recordError } = await supabase
    .from("self_track")
    .select("user_id")
    .eq("id", data.self_track_id)
    .single();

  if (recordError || !record || (record as any).user_id !== userData.user.id) {
    throw new Error("Unauthorized");
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
    throw new Error(`Failed to record payment: ${error.message}`);
  }

  return payment;
}

export async function updateSelfTrackStatus(recordId: string, status: SelfTrackStatus) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    throw new Error("Authentication required");
  }

  // Verify ownership
  const { data: record, error: recordError } = await supabase
    .from("self_track")
    .select("user_id")
    .eq("id", recordId)
    .single();

  if (recordError || !record || (record as any).user_id !== userData.user.id) {
    throw new Error("Unauthorized");
  }

  const { data: updated, error } = await supabase
    .from("self_track")
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq("id", recordId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }

  return updated;
}

export async function deleteSelfTrack(recordId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    throw new Error("Authentication required");
  }

  // Verify ownership
  const { data: record, error: recordError } = await supabase
    .from("self_track")
    .select("user_id")
    .eq("id", recordId)
    .single();

  if (recordError || !record || (record as any).user_id !== userData.user.id) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("self_track").delete().eq("id", recordId);

  if (error) {
    throw new Error(`Failed to delete self track: ${error.message}`);
  }
}

export async function deleteSelfTrackPayment(paymentId: string, recordId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    throw new Error("Authentication required");
  }

  // Verify ownership
  const { data: record, error: recordError } = await supabase
    .from("self_track")
    .select("user_id")
    .eq("id", recordId)
    .single();

  if (recordError || !record || (record as any).user_id !== userData.user.id) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("self_track_payments").delete().eq("id", paymentId);

  if (error) {
    throw new Error(`Failed to delete payment: ${error.message}`);
  }
}

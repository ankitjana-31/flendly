"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const requestSchema = z.object({
  recipientId: z.string().uuid(),
  direction: z.enum(["lend", "borrow"]),
  amount: z.number().positive("Amount must be greater than zero"),
  interestType: z.enum(["none", "simple", "compound"]),
  interestRate: z.number().min(0).nullable(),
  interestFrequency: z.enum(["daily", "monthly", "yearly"]).nullable(),
  compounding: z.enum(["daily", "monthly", "yearly"]).nullable(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  message: z.string().max(500).nullable().optional(),
});

export async function createRequestAction(formData: {
  recipientId: string;
  direction: "lend" | "borrow";
  amount: number;
  interestType: "none" | "simple" | "compound";
  interestRate: number | null;
  interestFrequency: "daily" | "monthly" | "yearly" | null;
  compounding: "daily" | "monthly" | "yearly" | null;
  deadline: string;
  message?: string | null;
}) {
  const parsed = requestSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Not authenticated." };
  }

  if (user.id === parsed.data.recipientId) {
    return { error: "You cannot create a request with yourself." };
  }

  // Insert the loan request
  const { data: request, error: requestError } = await supabase
    .from("loan_requests")
    .insert({
      sender_id: user.id,
      receiver_id: parsed.data.recipientId,
      direction: parsed.data.direction,
      status: "PENDING",
    })
    .select()
    .single();

  if (requestError || !request) {
    return { error: requestError?.message ?? "Failed to create loan request." };
  }

  // Insert the initial loan offer
  const { error: offerError } = await supabase
    .from("loan_offers")
    .insert({
      request_id: request.id,
      created_by: user.id,
      amount: parsed.data.amount.toString(),
      interest_type: parsed.data.interestType,
      interest_rate: parsed.data.interestRate !== null ? parsed.data.interestRate.toString() : null,
      interest_frequency: parsed.data.interestFrequency,
      compounding: parsed.data.compounding,
      deadline: parsed.data.deadline,
      message: parsed.data.message || null,
      status: "ACTIVE",
    });

  if (offerError) {
    // Attempt rollback of request
    await supabase.from("loan_requests").delete().eq("id", request.id);
    return { error: offerError.message };
  }

  revalidatePath("/", "layout");
  return { success: true, requestId: request.id };
}

export async function counterOfferAction(
  requestId: string,
  formData: {
    amount: number;
    interestType: "none" | "simple" | "compound";
    interestRate: number | null;
    interestFrequency: "daily" | "monthly" | "yearly" | null;
    compounding: "daily" | "monthly" | "yearly" | null;
    deadline: string;
    message?: string | null;
  }
) {
  const parsed = requestSchema.omit({ recipientId: true, direction: true }).safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid offer data." };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Not authenticated." };
  }

  const { error: offerError } = await supabase
    .from("loan_offers")
    .insert({
      request_id: requestId,
      created_by: user.id,
      amount: parsed.data.amount.toString(),
      interest_type: parsed.data.interestType,
      interest_rate: parsed.data.interestRate !== null ? parsed.data.interestRate.toString() : null,
      interest_frequency: parsed.data.interestFrequency,
      compounding: parsed.data.compounding,
      deadline: parsed.data.deadline,
      message: parsed.data.message || null,
      status: "ACTIVE",
    });

  if (offerError) {
    return { error: offerError.message };
  }

  revalidatePath("/", "layout");
  revalidatePath(`/requests/${requestId}`);
  return { success: true };
}

export async function declineRequestAction(requestId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("decline_request", { p_request_id: requestId });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath(`/requests/${requestId}`);
  return { success: true };
}

export async function cancelRequestAction(requestId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_request", { p_request_id: requestId });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath(`/requests/${requestId}`);
  return { success: true };
}

export async function acceptOfferAction(offerId: string, requestId: string) {
  const supabase = await createClient();
  const { data: loanId, error } = await supabase.rpc("accept_offer", { p_offer_id: offerId });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath(`/requests/${requestId}`);
  return { success: true, loanId };
}

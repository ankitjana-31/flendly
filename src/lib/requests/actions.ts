"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const interestFrequencySchema = z.enum(["daily", "monthly", "yearly"]);

const offerTermsSchema = z
  .object({
    amount: z.coerce.number().positive("Amount must be greater than zero."),
    interestType: z.enum(["none", "simple", "compound"]),
    interestRate: z.coerce.number().min(0).optional(),
    interestFrequency: interestFrequencySchema.optional(),
    compounding: interestFrequencySchema.optional(),
    deadline: z.string().refine((d) => d > new Date().toISOString().slice(0, 10), {
      message: "Deadline must be a future date.",
    }),
    message: z.string().trim().max(500).optional(),
  })
  .refine(
    (v) => v.interestType === "none" || (v.interestRate !== undefined && v.interestFrequency !== undefined),
    { message: "Interest rate and frequency are required unless there's no interest." },
  )
  .refine((v) => v.interestType !== "compound" || v.compounding !== undefined, {
    message: "Compounding frequency is required for compound interest.",
  });

export type ActionState = { error?: string; success?: boolean };

export async function createRequestAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const receiverUsername = String(formData.get("receiverUsername") ?? "")
    .trim()
    .toLowerCase();
  const direction = formData.get("direction") === "borrow" ? "borrow" : "lend";

  const parsed = offerTermsSchema.safeParse({
    amount: formData.get("amount"),
    interestType: formData.get("interestType"),
    interestRate: formData.get("interestRate") || undefined,
    interestFrequency: formData.get("interestFrequency") || undefined,
    compounding: formData.get("compounding") || undefined,
    deadline: formData.get("deadline"),
    message: formData.get("message") || undefined,
  });

  if (!receiverUsername) return { error: "Enter the username you want to send this to." };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request." };

  const terms = parsed.data;
  const supabase = await createClient();

  const { data: requestId, error } = await supabase.rpc("create_request", {
    p_receiver_username: receiverUsername,
    p_direction: direction,
    p_amount: terms.amount,
    p_interest_type: terms.interestType,
    p_interest_rate: terms.interestType === "none" ? null : terms.interestRate ?? null,
    p_interest_frequency: terms.interestType === "none" ? null : terms.interestFrequency ?? null,
    p_compounding: terms.interestType === "compound" ? terms.compounding ?? null : null,
    p_deadline: terms.deadline,
    p_message: terms.message ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/requests");
  revalidatePath("/dashboard");
  redirect(`/requests/${requestId}`);
}

export async function counterOfferAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const requestId = String(formData.get("requestId") ?? "");

  const parsed = offerTermsSchema.safeParse({
    amount: formData.get("amount"),
    interestType: formData.get("interestType"),
    interestRate: formData.get("interestRate") || undefined,
    interestFrequency: formData.get("interestFrequency") || undefined,
    compounding: formData.get("compounding") || undefined,
    deadline: formData.get("deadline"),
    message: formData.get("message") || undefined,
  });

  if (!requestId) return { error: "Missing request." };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid offer." };

  const terms = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { error } = await supabase.from("loan_offers").insert({
    request_id: requestId,
    created_by: user.id,
    amount: String(terms.amount),
    interest_type: terms.interestType,
    interest_rate: terms.interestType === "none" ? null : String(terms.interestRate),
    interest_frequency: terms.interestType === "none" ? null : terms.interestFrequency ?? null,
    compounding: terms.interestType === "compound" ? terms.compounding ?? null : null,
    deadline: terms.deadline,
    message: terms.message ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/requests");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function acceptOfferAction(offerId: string, requestId: string) {
  const supabase = await createClient();
  const { data: loanId, error } = await supabase.rpc("accept_offer", { p_offer_id: offerId });

  if (error) return { error: error.message };

  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/requests");
  revalidatePath("/dashboard");
  revalidatePath("/lent");
  revalidatePath("/borrowed");
  redirect(`/loans/${loanId}`);
}

export async function declineRequestAction(requestId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("decline_request", { p_request_id: requestId });

  if (error) return { error: error.message };

  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/requests");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function cancelRequestAction(requestId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_request", { p_request_id: requestId });

  if (error) return { error: error.message };

  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/requests");
  revalidatePath("/dashboard");
  return { success: true };
}

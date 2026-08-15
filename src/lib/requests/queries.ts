import { createClient } from "@/lib/supabase/server";

export type RequestParticipant = {
  id: string;
  username: string;
  full_name: string | null;
};

export type RequestListItem = {
  id: string;
  direction: "lend" | "borrow";
  status: "PENDING" | "COUNTERED" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  created_at: string;
  updated_at: string;
  sender: RequestParticipant;
  receiver: RequestParticipant;
  active_offer: {
    id: string;
    amount: string;
    interest_type: "none" | "simple" | "compound";
    interest_rate: string | null;
    interest_frequency: "daily" | "monthly" | "yearly" | null;
    compounding: "daily" | "monthly" | "yearly" | null;
    deadline: string;
    message: string | null;
    created_by: string;
  } | null;
};

const REQUEST_SELECT =
  "id, direction, status, created_at, updated_at, " +
  "sender:profiles!loan_requests_sender_id_fkey(id, username, full_name), " +
  "receiver:profiles!loan_requests_receiver_id_fkey(id, username, full_name), " +
  "loan_offers(id, amount, interest_type, interest_rate, interest_frequency, compounding, deadline, message, status, created_by, created_at)";

type RawRequestRow = {
  id: string;
  direction: "lend" | "borrow";
  status: RequestListItem["status"];
  created_at: string;
  updated_at: string;
  sender: RequestParticipant;
  receiver: RequestParticipant;
  loan_offers: Array<{
    id: string;
    amount: string;
    interest_type: "none" | "simple" | "compound";
    interest_rate: string | null;
    interest_frequency: "daily" | "monthly" | "yearly" | null;
    compounding: "daily" | "monthly" | "yearly" | null;
    deadline: string;
    message: string | null;
    status: string;
    created_by: string;
    created_at: string;
  }>;
};

function normalizeRequest(row: RawRequestRow): RequestListItem {
  const offers = row.loan_offers ?? [];

  const active = offers.find((o) => o.status === "ACTIVE") ?? null;

  return {
    id: row.id,
    direction: row.direction,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    sender: row.sender,
    receiver: row.receiver,
    active_offer: active
      ? {
          id: active.id,
          amount: active.amount,
          interest_type: active.interest_type,
          interest_rate: active.interest_rate,
          interest_frequency: active.interest_frequency,
          compounding: active.compounding,
          deadline: active.deadline,
          message: active.message,
          created_by: active.created_by,
        }
      : null,
  };
}

export async function listRequests(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("loan_requests")
    .select(REQUEST_SELECT)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("updated_at", { ascending: false })
    .returns<RawRequestRow[]>();

  if (error) throw error;

  const rows = (data ?? []).map(normalizeRequest);

  return {
    incoming: rows.filter((r) => r.receiver.id === userId),
    outgoing: rows.filter((r) => r.sender.id === userId),
  };
}

export type OfferHistoryItem = {
  id: string;
  amount: string;
  interest_type: "none" | "simple" | "compound";
  interest_rate: string | null;
  interest_frequency: "daily" | "monthly" | "yearly" | null;
  compounding: "daily" | "monthly" | "yearly" | null;
  deadline: string;
  message: string | null;
  status: "ACTIVE" | "SUPERSEDED" | "ACCEPTED" | "DECLINED";
  created_by: string;
  created_at: string;
};

export type RequestDetail = {
  id: string;
  direction: "lend" | "borrow";
  status: RequestListItem["status"];
  created_at: string;
  updated_at: string;
  sender: RequestParticipant;
  receiver: RequestParticipant;
  offers: OfferHistoryItem[];
  resultingLoanId: string | null;
};

export async function getRequestDetail(requestId: string): Promise<RequestDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("loan_requests")
    .select(
      "id, direction, status, created_at, updated_at, " +
        "sender:profiles!loan_requests_sender_id_fkey(id, username, full_name), " +
        "receiver:profiles!loan_requests_receiver_id_fkey(id, username, full_name), " +
        "loan_offers(id, amount, interest_type, interest_rate, interest_frequency, compounding, deadline, message, status, created_by, created_at)",
    )
    .eq("id", requestId)
    .maybeSingle()
    .returns<RawRequestRow>();

  if (error) throw error;
  if (!data) return null;

  let resultingLoanId: string | null = null;
  if (data.status === "ACCEPTED") {
    const { data: loan } = await supabase
      .from("loans")
      .select("id")
      .eq("request_id", requestId)
      .maybeSingle();
    resultingLoanId = loan?.id ?? null;
  }

  const offers = ((data.loan_offers ?? []) as OfferHistoryItem[]).sort((a, b) =>
    a.created_at < b.created_at ? -1 : 1,
  );

  return {
    id: data.id,
    direction: data.direction,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
    sender: data.sender as unknown as RequestParticipant,
    receiver: data.receiver as unknown as RequestParticipant,
    offers,
    resultingLoanId,
  };
}

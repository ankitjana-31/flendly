import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";
import { AuthedShell } from "@/components/layout/authed-shell";
import { NegotiationContainer } from "@/components/requests/negotiation-container";
import type { DBLoanRequest } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  const { id: requestId } = await params;
  const supabase = await createClient();

  // Fetch unread notifications count
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);

  const unreadCount = count ?? 0;

  // Fetch single loan request detail with profiles and offers
  const { data: rawRequest, error } = await supabase
    .from("loan_requests")
    .select(`
      id,
      direction,
      status,
      created_at,
      updated_at,
      sender_id,
      receiver_id,
      sender:profiles!sender_id (id, username, full_name, avatar_url),
      receiver:profiles!receiver_id (id, username, full_name, avatar_url),
      loan_offers (
        id,
        amount,
        interest_type,
        interest_rate,
        interest_frequency,
        compounding,
        deadline,
        message,
        status,
        created_by,
        created_at
      )
    `)
    .eq("id", requestId)
    .single();

  if (error || !rawRequest) {
    console.error("Error fetching request details:", error);
    redirect("/requests");
  }

  const request = rawRequest as unknown as DBLoanRequest;

  // Check authorization (user must be sender or receiver)
  if (request.sender_id !== user.id && request.receiver_id !== user.id) {
    redirect("/requests");
  }

  const isSender = request.sender_id === user.id;
  const counterparty = isSender ? request.receiver : request.sender;
  const senderName = request.sender?.full_name || `@${request.sender?.username || "user"}`;
  const receiverName = request.receiver?.full_name || `@${request.receiver?.username || "user"}`;

  return (
    <AuthedShell profile={profile} unreadCount={unreadCount}>
      <div className="space-y-6">
        {/* Back navigation & Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/requests"
            className="p-2 -ml-2 rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Agreement Negotiation
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl mt-0.5">
              Proposal with {counterparty?.full_name || `@${counterparty?.username}`}
            </h1>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="max-w-4xl mx-auto">
          <NegotiationContainer
            request={request}
            offers={request.loan_offers}
            currentUserId={user.id}
            senderName={senderName}
            receiverName={receiverName}
          />
        </div>
      </div>
    </AuthedShell>
  );
}

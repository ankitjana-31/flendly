import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Calendar, FileText, CheckCircle2 } from "lucide-react";

import { RetroWindow } from "@/components/ui/retro-window";
import { StatusBadge } from "@/components/ui/status-badge";
import { RequestActions } from "@/components/negotiation/request-actions";
import { NotificationDetailWindow } from "@/components/notifications/notification-detail-window";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { getRequestDetail } from "@/lib/requests/queries";
import { formatMoney, formatDateTime, formatDate, interestSummary } from "@/lib/format";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const request = await getRequestDetail(id);
  if (!request) notFound();

  if (request.sender.id !== user.id && request.receiver.id !== user.id) notFound();

  const activeOffer = request.offers.find((o) => o.status === "ACTIVE") ?? null;
  const isOpen = ["PENDING", "COUNTERED"].includes(request.status);
  const other = request.sender.id === user.id ? request.receiver : request.sender;
  const isSender = request.sender.id === user.id;
  const isLend = request.direction === "lend";

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-16 font-mono">
      {/* Back button and header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black/10 dark:border-white/20 pb-4">
        <div>
          <Link
            href="/requests"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white uppercase mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO ALL REQUESTS</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 border border-black font-black text-xs uppercase ${
              isLend ? "bg-[#2DD4BF] text-black" : "bg-[#FFE600] text-black"
            }`}>
              {isLend ? "LENDING PROPOSAL" : "BORROWING PROPOSAL"}
            </span>
            <span className="text-gray-400">//</span>
            <span className="text-gray-600 dark:text-gray-300 text-xs font-bold uppercase">
              {other.full_name ?? `@${other.username}`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight mt-1">
            {isSender ? "Your Request to " : "Request from "} {other.full_name ?? `@${other.username}`}
          </h1>
        </div>

        <StatusBadge status={request.status} />
      </div>

      {/* Accepted notice banner */}
      {request.status === "ACCEPTED" && request.resultingLoanId && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-[2.5px] border-black bg-[#2DD4BF] text-black shadow-[4px_4px_0_0_#000]">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Proposal approved! This agreement is now an active peer loan.</span>
          </div>
          <Link
            href={`/loans/${request.resultingLoanId}`}
            className="px-4 py-1.5 border-[2px] border-black bg-white text-black font-black text-xs uppercase shadow-[2px_2px_0_0_#000] hover:bg-gray-100 shrink-0 text-center"
          >
            VIEW ACTIVE LOAN →
          </Link>
        </div>
      )}

      {/* Active Proposal Card */}
      {activeOffer && (
        <RetroWindow
          title="ACTIVE PROPOSAL TERMS"
          subtitle={`Proposed by ${activeOffer.created_by === user.id ? "You" : (other.full_name ?? `@${other.username}`)}`}
          colorBar={isLend ? "pink" : "yellow"}
          glow={true}
          className="bg-white dark:bg-[var(--card)] border-[2.5px] border-black dark:border-white shadow-[6px_6px_0_0_#000000]"
          contentClassName="p-5 sm:p-6"
        >
          <div className="space-y-5">
            {/* Offer Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[var(--muted)]">
                <span className="text-[10px] uppercase text-gray-500 font-bold block">Proposed Amount</span>
                <p className="text-2xl font-black text-black dark:text-white mt-0.5">
                  {formatMoney(activeOffer.amount)}
                </p>
              </div>

              <div className="p-4 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[var(--muted)]">
                <span className="text-[10px] uppercase text-gray-500 font-bold block">Interest Structure</span>
                <p className="text-sm font-bold text-black dark:text-white mt-1">
                  {interestSummary(activeOffer)}
                </p>
              </div>

              <div className="p-4 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[var(--muted)]">
                <span className="text-[10px] uppercase text-gray-500 font-bold block">Closure Deadline</span>
                <p className="text-sm font-bold text-black dark:text-white mt-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {formatDate(activeOffer.deadline)}
                </p>
              </div>
            </div>

            {activeOffer.message && (
              <div className="p-3.5 border-[2px] border-black/30 dark:border-white/30 bg-[#FAF8F5] dark:bg-[var(--muted)]">
                <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Attached Note:</span>
                <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 italic flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                  &quot;{activeOffer.message}&quot;
                </p>
              </div>
            )}

            {/* Action Bar */}
            {isOpen && (
              <div className="pt-2 border-t border-black/10 dark:border-white/10">
                <RequestActions request={request} activeOffer={activeOffer} viewerId={user.id} />
              </div>
            )}
          </div>
        </RetroWindow>
      )}

      {/* Negotiation History Window */}
      <NotificationDetailWindow
        title="NEGOTIATION AUDIT TRAIL"
        subtitle={`${request.offers.length} recorded proposals`}
      >
        <div className="space-y-3">
          {request.offers.map((offer, idx) => {
            const isCreator = offer.created_by === user.id;
            return (
              <div
                key={offer.id}
                className={`p-4 border-[2px] border-black dark:border-white/40 shadow-[2px_2px_0_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  offer.status === "ACTIVE"
                    ? "bg-[#FFE600]/20 dark:bg-[#2E2800] border-l-[6px] border-l-[#FFE600]"
                    : "bg-[#FAF8F5] dark:bg-[var(--muted)]"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-black dark:text-white">
                      {formatMoney(offer.amount)}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                      · {interestSummary(offer)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Proposed by <span className="font-bold text-black dark:text-white">{isCreator ? "You" : (other.full_name ?? `@${other.username}`)}</span> · Due {formatDate(offer.deadline)}
                  </p>
                  {offer.message && (
                    <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                      &quot;{offer.message}&quot;
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0">
                  <StatusBadge status={offer.status} />
                  <span className="text-[10px] text-gray-500">
                    {formatDateTime(offer.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </NotificationDetailWindow>
    </div>
  );
}

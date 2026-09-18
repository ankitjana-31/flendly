import Link from "next/link";
import { redirect } from "next/navigation";

import { LinkButton } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { RetroWindow } from "@/components/ui/retro-window";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { listRequests, type RequestListItem } from "@/lib/requests/queries";
import { formatMoney, interestSummary } from "@/lib/format";
import { Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { RequestsTabs } from "@/components/requests/requests-tabs";

function RequestRow({ request, viewerId }: { request: RequestListItem; viewerId: string }) {
  const other = request.sender.id === viewerId ? request.receiver : request.sender;
  const isSender = request.sender.id === viewerId;

  return (
    <Link
      href={`/requests/${request.id}`}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[var(--muted)] text-black dark:text-white shadow-[3px_3px_0_0_#000] hover:bg-[#FFE600] hover:text-black dark:hover:bg-[#FFE600] dark:hover:text-black hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000] transition-all font-mono"
    >
      <div className="flex items-center gap-3.5">
        <div className={`w-10 h-10 border-[2px] border-black flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-[2px_2px_0_0_#000] ${
          request.direction === "lend" ? "bg-[#2DD4BF] text-black" : "bg-[#F43F5E] text-white"
        }`}>
          {request.direction === "lend" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-base sm:text-lg font-black tracking-tight group-hover:text-black dark:group-hover:text-black transition-colors">
            {other.full_name ?? `@${other.username}`}
          </p>
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-black font-bold mt-0.5 transition-colors">
            {isSender ? "You initiated" : "Requested from you"} ·{" "}
            {request.direction === "lend" ? "You lend" : "You borrow"}
            {request.active_offer ? ` · ${interestSummary(request.active_offer)}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-black/10 dark:border-white/10">
        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-black block font-bold transition-colors">Offer Amount</span>
          <p className="font-mono text-lg sm:text-xl font-black group-hover:text-black dark:group-hover:text-black transition-colors">
            {request.active_offer ? formatMoney(request.active_offer.amount) : "—"}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>
    </Link>
  );
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const { tab } = await searchParams;
  const activeTab = tab === "outgoing" ? "outgoing" : "incoming";

  const { incoming, outgoing } = await listRequests(user.id);
  const rows = activeTab === "incoming" ? incoming : outgoing;

  const renderRows = (requestRows: RequestListItem[], emptyMessage: string, emptyDescription: string) =>
    requestRows.length === 0 ? (
      <div className="border-[2px] border-dashed border-black/30 dark:border-white/30 p-10 text-center bg-[#FAF8F5] dark:bg-[var(--muted)]">
        <div className="w-10 h-10 border-[2px] border-black bg-[#FFE600] flex items-center justify-center mx-auto mb-3 text-black font-bold">
          ⚡
        </div>
        <h3 className="font-mono text-base font-bold text-black dark:text-white uppercase">{emptyMessage}</h3>
        <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          {emptyDescription}
        </p>
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        {requestRows.map((request) => (
          <RequestRow key={request.id} request={request} viewerId={user.id} />
        ))}
      </div>
    );

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-16 font-mono">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black/10 dark:border-white/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400">
            <span>[PEER_NEGOTIATIONS]</span>
            <span className="hidden sm:inline text-gray-400">//</span>
            <span className="hidden sm:inline text-gray-600 dark:text-gray-300 uppercase">PROPOSALS & AGREEMENTS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight mt-1">
            Requests & Agreements
          </h1>
        </div>

        <LinkButton href="/requests/new" size="md">
          <Plus className="w-4 h-4" />
          <span>NEW REQUEST</span>
        </LinkButton>
      </div>

      {/* Main Window */}
      <RetroWindow
        title={
          <>
            <span>REQUESTS</span>
            <span className="hidden sm:inline"> // {activeTab.toUpperCase()}</span>
          </>
        }
        subtitle={`${rows.length} total entries`}
        colorBar={activeTab === "incoming" ? "blue" : "yellow"}
        className="bg-white dark:bg-[var(--card)] border-[2.5px] border-black dark:border-white shadow-[6px_6px_0_0_#000000]"
        contentClassName="p-5 sm:p-6"
        headerRight={
          <span className="px-2.5 py-0.5 border border-black bg-white text-black font-mono text-[11px] font-black uppercase">
            {rows.length} {activeTab.toUpperCase()}
          </span>
        }
      >
        {/* Tab Controls */}
        <RequestsTabs
          incomingCount={incoming.length}
          outgoingCount={outgoing.length}
          activeTab={activeTab}
          incomingContent={renderRows(incoming, "No incoming requests", "You don't have any pending requests from friends. You can create a new request with the button above.")}
          outgoingContent={renderRows(outgoing, "No sent requests", "You haven't sent any loan or borrow requests yet.")}
        />
      </RetroWindow>
    </div>
  );
}

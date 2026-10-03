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
      className="group/req flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-5 rounded-[8px] border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[var(--card)] text-black dark:text-white shadow-[2px_2px_0_0_#000] sm:shadow-[3px_3px_0_0_#000] hover:bg-[#FFE600] hover:text-black dark:hover:bg-[#FFE600] dark:hover:text-black hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000] transition-all font-mono"
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] border-[2px] border-black flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-[1.5px_1.5px_0_0_#000] ${
          request.direction === "lend" ? "bg-[#2DD4BF] text-black" : "bg-[#F43F5E] text-white"
        }`}>
          {request.direction === "lend" ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm sm:text-lg font-black tracking-tight text-black dark:text-white group-hover/req:text-black dark:group-hover/req:text-black transition-colors truncate">
            {other.full_name ?? `@${other.username}`}
          </p>
          <p className="text-[11px] sm:text-sm text-gray-700 dark:text-gray-300 group-hover/req:text-black dark:group-hover/req:text-black font-bold mt-0.5 transition-colors truncate">
            {isSender ? "You initiated" : "Requested from you"} ·{" "}
            {request.direction === "lend" ? "You lend" : "You borrow"}
            {request.active_offer ? ` · ${interestSummary(request.active_offer)}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-black/10 dark:border-white/10">
        <div className="text-left sm:text-right">
          <span className="text-[9px] sm:text-[10px] uppercase text-gray-600 dark:text-gray-400 group-hover/req:text-black dark:group-hover/req:text-black block font-bold transition-colors">Amount</span>
          <p className="font-mono text-base sm:text-xl font-black text-black dark:text-white group-hover/req:text-black dark:group-hover/req:text-black transition-colors">
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
      <div className="rounded-[8px] border-[2px] border-dashed border-black/30 dark:border-white/30 p-6 sm:p-10 text-center bg-[#FAF8F5] dark:bg-[var(--muted)]">
        <div className="w-9 h-9 rounded-[6px] border-[2px] border-black bg-[#FFE600] flex items-center justify-center mx-auto mb-2.5 text-black font-bold">
          ⚡
        </div>
        <h3 className="font-mono text-sm sm:text-base font-bold text-black dark:text-white uppercase">{emptyMessage}</h3>
        <p className="hidden sm:block font-mono text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          {emptyDescription}
        </p>
      </div>
    ) : (
      <div className="flex flex-col gap-2.5 sm:gap-3">
        {requestRows.map((request) => (
          <RequestRow key={request.id} request={request} viewerId={user.id} />
        ))}
      </div>
    );

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 sm:gap-6 px-3 sm:px-6 md:px-8 py-3 sm:py-6 pb-16 font-mono">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b-[2px] border-black/10 dark:border-white/20 pb-3 sm:pb-4">
        <div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400">
            <span>[PEER_NEGOTIATIONS]</span>
            <span className="text-gray-400">//</span>
            <span className="text-gray-600 dark:text-gray-300 uppercase">PROPOSALS & AGREEMENTS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight mt-0.5 sm:mt-1">
            Requests & Agreements
          </h1>
        </div>

        <LinkButton href="/requests/new" size="md">
          <Plus className="w-4 h-4 stroke-[2.5]" />
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
          <span className="px-2.5 py-0.5 border border-black bg-[#2DD4BF] !text-black font-mono text-[11px] font-black uppercase shadow-[1px_1px_0_0_#000]">
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

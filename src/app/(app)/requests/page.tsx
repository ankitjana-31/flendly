import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, LinkButton } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { listRequests, type RequestListItem } from "@/lib/requests/queries";
import { formatMoney, interestSummary } from "@/lib/format";

function RequestRow({ request, viewerId }: { request: RequestListItem; viewerId: string }) {
  const other = request.sender.id === viewerId ? request.receiver : request.sender;

  return (
    <Link href={`/requests/${request.id}`}>
      <Card className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">{other.full_name ?? `@${other.username}`}</p>
          <p className="text-xs text-muted-foreground">
            {request.direction === "lend" ? "You lend" : "You borrow"}
            {request.active_offer ? ` · ${interestSummary(request.active_offer)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
          <p className="font-tabular text-base font-semibold">
            {request.active_offer ? formatMoney(request.active_offer.amount) : "—"}
          </p>
          <StatusBadge status={request.status} />
        </div>
      </Card>
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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Requests</h1>
        <LinkButton href="/requests/new" size="sm">
          New request
        </LinkButton>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <Link
          href="/requests?tab=incoming"
          className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
            activeTab === "incoming" ? "bg-card shadow-sm" : "text-muted-foreground"
          }`}
        >
          Incoming ({incoming.length})
        </Link>
        <Link
          href="/requests?tab=outgoing"
          className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
            activeTab === "outgoing" ? "bg-card shadow-sm" : "text-muted-foreground"
          }`}
        >
          Sent ({outgoing.length})
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {activeTab === "incoming" ? "No requests waiting on you." : "You haven't sent any requests."}
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r) => (
            <RequestRow key={r.id} request={r} viewerId={user.id} />
          ))}
        </div>
      )}
    </div>
  );
}

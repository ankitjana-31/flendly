import { notFound, redirect } from "next/navigation";

import { Card, LinkButton } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { RequestActions } from "@/components/negotiation/request-actions";
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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            {other.full_name ?? `@${other.username}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {request.direction === "lend" ? "Lending arrangement" : "Borrowing arrangement"}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {request.status === "ACCEPTED" && request.resultingLoanId && (
        <Card className="flex items-center justify-between border-success/30 bg-success/5 p-4">
          <p className="text-sm font-medium text-success">This offer became a loan.</p>
          <LinkButton href={`/loans/${request.resultingLoanId}`} size="sm" variant="secondary">
            View loan
          </LinkButton>
        </Card>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Negotiation history</h2>
        {request.offers.map((offer) => (
          <Card key={offer.id} className={`p-4 ${offer.status === "ACTIVE" ? "border-accent/40" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-tabular text-lg font-semibold">{formatMoney(offer.amount)}</p>
                <p className="text-sm text-muted-foreground">{interestSummary(offer)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Repay by {formatDate(offer.deadline)} · proposed by{" "}
                  {offer.created_by === user.id ? "you" : other.full_name ?? `@${other.username}`}
                </p>
                {offer.message && <p className="mt-2 text-sm">{offer.message}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={offer.status} />
                <p className="text-xs text-muted-foreground">{formatDateTime(offer.created_at)}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      {isOpen && activeOffer && (
        <section>
          <RequestActions request={request} activeOffer={activeOffer} viewerId={user.id} />
        </section>
      )}
    </div>
  );
}

import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { LinkButton, Card } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { getDashboardAggregates } from "@/lib/loans/queries";
import { listRequests } from "@/lib/requests/queries";
import { getSelfTrackStats, listSelfTracks } from "@/lib/self-track/queries";
import { formatMoney, formatDate, daysUntil } from "@/lib/format";
import { SelfTrackForm } from "@/components/self-track/self-track-form";
import { SelfTrackList } from "@/components/self-track/self-track-list";

export default async function DashboardPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const [aggregates, requests, selfTrackStats, selfTracks] = await Promise.all([
    getDashboardAggregates(user.id),
    listRequests(user.id),
    getSelfTrackStats(user.id),
    listSelfTracks(user.id),
  ]);

  const openRequests = [...requests.incoming, ...requests.outgoing].filter((r) =>
    ["PENDING", "COUNTERED"].includes(r.status),
  );

  const hasCompletedDeals =
    aggregates.totalLent > 0 || aggregates.totalBorrowed > 0 ||
    aggregates.overdue.length > 0 || aggregates.upcoming.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">
          {profile?.full_name ?? `@${profile?.username}`}
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">You&apos;re owed</p>
          <p className="mt-2 font-tabular text-3xl font-bold text-success">
            {formatMoney(aggregates.totalLent)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            across {aggregates.activeLentCount} active loan{aggregates.activeLentCount === 1 ? "" : "s"}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">You owe</p>
          <p className="mt-2 font-tabular text-3xl font-bold text-danger">
            {formatMoney(aggregates.totalBorrowed)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            across {aggregates.activeBorrowedCount} active loan
            {aggregates.activeBorrowedCount === 1 ? "" : "s"}
          </p>
        </Card>
      </div>

      {aggregates.overdue.length > 0 && (
        <Card className="border-danger/40 bg-danger/5 p-5">
          <h2 className="font-heading text-sm font-semibold text-danger">Overdue</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {aggregates.overdue.map((loan: any) => (
              <li key={loan.id}>
                <a href={`/loans/${loan.id}`} className="flex items-center justify-between text-sm hover:underline">
                  <span>
                    {loan.counterparty.full_name ?? `@${loan.counterparty.username}`} ·{" "}
                    {formatMoney(loan.ledger?.outstanding)}
                  </span>
                  <span className="text-muted-foreground">due {formatDate(loan.due_date)}</span>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {aggregates.upcoming.length > 0 && (
        <Card className="border-warning/40 bg-warning/5 p-5">
          <h2 className="font-heading text-sm font-semibold text-warning">Due soon</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {aggregates.upcoming.map((loan: any) => (
              <li key={loan.id}>
                <a href={`/loans/${loan.id}`} className="flex items-center justify-between text-sm hover:underline">
                  <span>
                    {loan.counterparty.full_name ?? `@${loan.counterparty.username}`} ·{" "}
                    {formatMoney(loan.ledger?.outstanding)}
                  </span>
                  <span className="text-muted-foreground">
                    {daysUntil(loan.due_date) === 0 ? "due today" : `due in ${daysUntil(loan.due_date)}d`}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {hasCompletedDeals && (
        <Card className="p-5 border-primary/20 bg-primary/5">
          <h2 className="font-heading text-sm font-semibold">Loan Summary</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Total Lent</p>
              <p className="mt-1 font-tabular text-lg font-bold text-success">
                {formatMoney(aggregates.totalLent)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Borrowed</p>
              <p className="mt-1 font-tabular text-lg font-bold text-danger">
                {formatMoney(aggregates.totalBorrowed)}
              </p>
            </div>
          </div>
        </Card>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Open requests</h2>
          <LinkButton href="/requests/new" size="sm">
            New request
          </LinkButton>
        </div>

        {openRequests.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No open requests. Start one with the button above.
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {openRequests.slice(0, 5).map((r: any) => {
              const other = r.sender.id === user.id ? r.receiver : r.sender;
              return (
                <a key={r.id} href={`/requests/${r.id}`}>
                  <Card className="flex items-center justify-between p-4 transition-colors hover:bg-muted">
                    <div>
                      <p className="text-sm font-medium">
                        {other.full_name ?? `@${other.username}`} ·{" "}
                        {r.active_offer ? formatMoney(r.active_offer.amount) : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.sender.id === user.id ? "You sent" : "Sent to you"} ·{" "}
                        {r.direction === "lend" ? "you lend" : "you borrow"}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Personal Tracking</h2>
          <div className="text-xs text-muted-foreground">
            {selfTracks.length > 0 && `${selfTracks.length} record${selfTracks.length !== 1 ? "s" : ""}`}
          </div>
        </div>

        <SelfTrackForm />

        {selfTracks.length > 0 && <SelfTrackList records={selfTracks} />}
      </section>
    </div>
  );
}

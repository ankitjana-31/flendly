import { redirect } from "next/navigation";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { getDashboardAggregates } from "@/lib/loans/queries";
import { listRequests } from "@/lib/requests/queries";
import { clientListSelfTracks } from "@/lib/self-track/client";

export default async function DashboardPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const [aggregates, requests, selfTracks] = await Promise.all([
    getDashboardAggregates(user.id),
    listRequests(user.id),
    clientListSelfTracks(user.id),
  ]);

  const openRequests = [...requests.incoming, ...requests.outgoing].filter((r) =>
    ["PENDING", "COUNTERED"].includes(r.status),
  );

  // Check if user has any completed deals (non-zero aggregates indicate real activity)
  const hasCompletedDeals =
    aggregates.totalLent > 0 || aggregates.totalBorrowed > 0 ||
    aggregates.overdue.length > 0 || aggregates.upcoming.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
      <DashboardContent
        profile={profile}
        aggregates={aggregates}
        requests={requests}
        openRequests={openRequests}
        hasCompletedDeals={hasCompletedDeals}
        selfTrackStats={{}} // Empty object for now, can be enhanced later
        selfTracks={selfTracks}
        userId={user.id}
      />
    </div>
  );
}

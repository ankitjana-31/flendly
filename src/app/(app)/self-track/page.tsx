import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { listSelfTracks } from "@/lib/self-track/queries";
import { SelfTrackForm } from "@/components/self-track/self-track-form";
import { SelfTrackList } from "@/components/self-track/self-track-list";
import { Card } from "@/components/ui/button";

export default async function SelfTrackPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const selfTracks = await listSelfTracks(user.id);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Personal Tracking</h1>
        <p className="mt-2 text-muted-foreground">
          Keep a private record of personal loans and borrowings. This is separate from Flendly deals.
        </p>
      </div>

      {/* Form Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <SelfTrackForm />
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          <Card className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Records</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{selfTracks.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {selfTracks.filter(r => r.status === 'active').length}
            </p>
          </Card>
        </div>
      </div>

      {/* Records Section */}
      <div>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
          {selfTracks.length === 0 ? "No records yet" : "Your Records"}
        </h2>

        {selfTracks.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>Start by adding your first personal record above.</p>
          </Card>
        ) : (
          <SelfTrackList records={selfTracks} />
        )}
      </div>
    </div>
  );
}

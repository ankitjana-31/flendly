import { redirect } from "next/navigation";

import { Card } from "@/components/ui/button";
import { NewRequestForm } from "@/components/negotiation/new-request-form";
import { getCurrentUserProfile } from "@/lib/auth/queries";

export default async function NewRequestPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 md:px-8">
      <h1 className="font-heading text-2xl font-bold">New request</h1>
      <Card className="p-6">
        <NewRequestForm />
      </Card>
    </div>
  );
}

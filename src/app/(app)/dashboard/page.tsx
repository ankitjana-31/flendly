import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/queries";
import { FinancialHorizonScreen } from "@/components/screens/financial-horizon";

export default async function DashboardPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  return <FinancialHorizonScreen />;
}

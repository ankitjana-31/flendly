import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { RetroWindow } from "@/components/ui/retro-window";
import { NewRequestForm } from "@/components/negotiation/new-request-form";
import { getCurrentUserProfile } from "@/lib/auth/queries";

export default async function NewRequestPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-16 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black/10 dark:border-white/20 pb-4">
        <div>
          <Link
            href="/requests"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white uppercase mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO ALL REQUESTS</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] dark:text-[#60A5FA]">
            <span>[PEER_NEGOTIATOR]</span>
            <span className="text-gray-400">//</span>
            <span className="text-gray-600 dark:text-gray-300 uppercase">NEW PROPOSAL DISPATCH</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight mt-1">
            Initiate Peer Agreement
          </h1>
        </div>
      </div>

      {/* Main Window */}
      <div className="max-w-2xl mx-auto w-full">
        <RetroWindow
          title="PROPOSAL WIZARD // FORM_v2.0"
          subtitle="Configure amount, interest structure, and closure deadline"
          colorBar="yellow"
          glow={true}
          className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[6px_6px_0_0_#000000]"
          contentClassName="p-5 sm:p-7"
        >
          <NewRequestForm />
        </RetroWindow>
      </div>
    </div>
  );
}

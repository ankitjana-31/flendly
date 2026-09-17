"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox, LoaderCircle, Send } from "lucide-react";

export function RequestsTabs({ incomingCount, outgoingCount, activeTab: initialTab, incomingContent, outgoingContent }: {
  incomingCount: number;
  outgoingCount: number;
  activeTab: "incoming" | "outgoing";
  incomingContent: React.ReactNode;
  outgoingContent: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    router.prefetch(`${pathname}?tab=incoming`);
    router.prefetch(`${pathname}?tab=outgoing`);
  }, [pathname, router]);

  const selectTab = (tab: "incoming" | "outgoing") => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    startTransition(() => router.push(`${pathname}?tab=${tab}`));
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4 sm:mb-6 border-b-[2px] border-black/10 dark:border-white/10 pb-3 sm:pb-4">
        <button
        type="button"
        onClick={() => selectTab("incoming")}
        disabled={isPending}
        aria-current={activeTab === "incoming" ? "page" : undefined}
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 border-[2px] border-black font-mono text-[11px] sm:text-sm font-bold uppercase transition-all disabled:cursor-wait disabled:opacity-70 ${
          activeTab === "incoming"
            ? "bg-[#FFE600] text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5"
            : "bg-[#FAF8F5] dark:bg-[#1E212D] text-gray-700 dark:text-gray-300 shadow-[1px_1px_0_0_#000] hover:bg-gray-100"
        }`}
      >
        <Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>INCOMING ({incomingCount})</span>
        </button>

        <button
        type="button"
        onClick={() => selectTab("outgoing")}
        disabled={isPending}
        aria-current={activeTab === "outgoing" ? "page" : undefined}
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 border-[2px] border-black font-mono text-[11px] sm:text-sm font-bold uppercase transition-all disabled:cursor-wait disabled:opacity-70 ${
          activeTab === "outgoing"
            ? "bg-[#FFE600] text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5"
            : "bg-[#FAF8F5] dark:bg-[#1E212D] text-gray-700 dark:text-gray-300 shadow-[1px_1px_0_0_#000] hover:bg-gray-100"
        }`}
      >
        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>SENT ({outgoingCount})</span>
        </button>

        {isPending && <LoaderCircle className="ml-auto h-4 w-4 animate-spin text-[#2563EB]" aria-label="Syncing requests" />}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === "incoming" ? -8 : 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === "incoming" ? 8 : -8 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          {activeTab === "incoming" ? incomingContent : outgoingContent}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

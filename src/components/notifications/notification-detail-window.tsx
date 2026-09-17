"use client";

import { useRouter } from "next/navigation";

import { RetroWindow } from "@/components/ui/retro-window";

export function NotificationDetailWindow({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <RetroWindow
      title={title}
      subtitle={subtitle}
      colorBar="blue"
      className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[6px_6px_0_0_#000000]"
      contentClassName="p-5 sm:p-6"
      onClose={() => router.push("/notifications")}
    >
      {children}
    </RetroWindow>
  );
}

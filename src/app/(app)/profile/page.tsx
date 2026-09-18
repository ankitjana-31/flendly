import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { DraggableProfileWindow } from "@/components/profile/draggable-profile-window";
import { UserAvatar } from "@/components/users/user-avatar";
import { User, Settings, LogOut, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";

export default async function ProfilePage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-lg">
        <DraggableProfileWindow
          title="USER PROFILE // IDENTITY"
          subtitle="AUTHENTICATED SESSION"
          colorBar="yellow"
          glow={true}
          className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#FFE600]"
          contentClassName="p-6 sm:p-8"
          headerRight={
            <div className="flex items-center gap-1.5 px-2 py-0.5 border border-black bg-[#2DD4BF] text-black font-mono text-[10px] font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ONLINE</span>
            </div>
          }
        >
          {/* Brand Header */}
          <div className="mb-6 flex items-center justify-between border-b-[2px] border-black/10 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <UserAvatar name={profile?.full_name} username={profile?.username} src={profile?.avatar_url} />
              <div>
                <span className="font-mono text-base font-bold tracking-tight text-black dark:text-white block">
                  FLENDLY
                </span>
                <span className="font-mono text-[10px] text-gray-500 uppercase">
                  PEER LEDGER AUTH
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 border border-black bg-[#FAF8F5] dark:bg-[#1E212D] text-black dark:text-white font-mono text-xs font-bold shadow-[1px_1px_0_0_#000]">
              VERIFIED USER
            </span>
          </div>

          {/* Profile Information Block */}
          <div className="space-y-4">
            <div className="p-4 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000]">
              <span className="font-mono text-[10px] font-bold uppercase text-gray-500 block mb-1">
                PUBLIC IDENTITY
              </span>
              <h1 className="font-mono text-2xl sm:text-3xl font-black text-black dark:text-white">
                {profile?.full_name ?? `@${profile?.username}`}
              </h1>
              <p className="font-mono text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold mt-1">
                @{profile?.username}
              </p>
            </div>

            {/* Profile Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 border border-black/20 dark:border-white/20 bg-white dark:bg-[#161821]">
                <span className="text-gray-500 text-[10px] block font-bold uppercase">Account Status</span>
                <span className="font-bold text-[#059669] dark:text-[#2DD4BF] flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Active & Verified
                </span>
              </div>
              <div className="p-3 border border-black/20 dark:border-white/20 bg-white dark:bg-[#161821]">
                <span className="text-gray-500 text-[10px] block font-bold uppercase">Platform Role</span>
                <span className="font-bold text-black dark:text-white mt-0.5 block">
                  Peer Borrower & Lender
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-5 border-t-[2px] border-black/10 dark:border-white/10 flex gap-3 font-mono text-xs">
            <Link
              href="/profile/settings"
              className="flex-1 py-3 px-4 bg-[#2563EB] text-white border-[2px] border-black font-bold uppercase shadow-[3px_3px_0_0_#000000] hover:bg-blue-600 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <form action={signOut} className="flex-1">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#F43F5E] text-white border-[2px] border-black font-bold uppercase shadow-[3px_3px_0_0_#000000] hover:bg-rose-600 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </DraggableProfileWindow>
      </div>
    </div>
  );
}
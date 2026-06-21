import type { Metadata } from "next";
import Link from "next/link";
import { Dumbbell, LayoutDashboard, Building2, User, Swords, CreditCard, Users } from "lucide-react";
import { OwnerLogoutButton } from "@/components/owner/OwnerLogoutButton";
import { getOwnerSession } from "@/lib/owner-auth";
import { businessCategoryLabel } from "@/lib/owner-constants";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Owner Portal | GymFinder PK",
  robots: { index: false, follow: false },
};

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await getOwnerSession();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-[#0B2545] text-white">
        <div className="p-5 border-b border-white/10">
          <Link href="/owner/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF6A3D] rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-heading font-bold text-sm leading-tight">GymFinder PK</div>
              <div className="text-xs text-[#8ba0b8]">Owner Portal</div>
            </div>
          </Link>
        </div>

        {session && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs">
              {session.businessCategory === "fighting_club" ? (
                <Swords className="w-3.5 h-3.5 text-[#FF6A3D]" />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
              )}
              <span className="text-[#8ba0b8]">{businessCategoryLabel(session.businessCategory)}</span>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <Link href="/owner/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/owner/gym" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <Building2 className="w-4 h-4" />
            My Listing
          </Link>
          <Link href="/owner/memberships" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <CreditCard className="w-4 h-4" />
            Memberships
          </Link>
          <Link href="/owner/team" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <Users className="w-4 h-4" />
            Team & Coaches
          </Link>
          <Link href="/owner/equipment" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <Dumbbell className="w-4 h-4" />
            Equipment
          </Link>
          <Link href="/owner/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <User className="w-4 h-4" />
            My Profile
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#8ba0b8] hover:text-white hover:bg-white/10 transition-colors">
            ← Back to site
          </Link>
          <OwnerLogoutButton />
        </div>
      </aside>

      <main className="ml-60 min-h-screen">{children}</main>
    </div>
  );
}

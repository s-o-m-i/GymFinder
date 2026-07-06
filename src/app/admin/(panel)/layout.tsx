import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, Users, BarChart3, UserRound, Sparkles, Building2 } from "lucide-react";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { SiteLogoStack } from "@/components/layout/SiteLogo";

export const metadata: Metadata = {
  title: "Admin Panel | fitnessadda PK",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[#0B2545] text-white flex flex-col">
        <div className="p-5 border-b border-white/10">
          <SiteLogoStack
            href="/admin"
            size="sm"
            caption="Admin Panel"
            captionClassName="text-[#8ba0b8]"
          />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/add-gym"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Gym
          </Link>
          <Link
            href="/admin/owners"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Users className="w-4 h-4" />
            Owners
          </Link>
          <Link
            href="/admin/trainers"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <UserRound className="w-4 h-4" />
            Trainers
          </Link>
          <Link
            href="/admin/featured-requests"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Featured Requests
          </Link>
          <Link
            href="/admin/claims"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Profile Claims
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#8ba0b8] hover:text-white hover:bg-white/10 transition-colors"
          >
            ← Back to site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

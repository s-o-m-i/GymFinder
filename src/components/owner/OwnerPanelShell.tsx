"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  CreditCard,
  Dumbbell,
  HelpCircle,
  Images,
  LayoutDashboard,
  Layers,
  MapPin,
  Menu,
  Sparkles,
  Swords,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import type { OwnerSession } from "@/lib/owner-auth";
import { businessCategoryLabel } from "@/lib/owner-constants";
import { OwnerLogoutButton } from "@/components/owner/OwnerLogoutButton";
import { SiteLogoStack } from "@/components/layout/SiteLogo";

const NAV_LINKS = [
  { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/gym", label: "My Listing", icon: Building2 },
  { href: "/owner/branches", label: "Branches", icon: MapPin },
  { href: "/owner/common", label: "Common Settings", icon: Layers },
  { href: "/owner/memberships", label: "Memberships", icon: CreditCard },
  { href: "/owner/team", label: "Team & Coaches", icon: Users },
  { href: "/owner/equipment", label: "Equipment", icon: Dumbbell },
  { href: "/owner/transformations", label: "Transformations", icon: Images },
  { href: "/owner/success-stories", label: "Success Stories", icon: Trophy },
  { href: "/owner/events", label: "Events", icon: CalendarDays },
  { href: "/owner/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/owner/featured", label: "Promote Listing", icon: Sparkles },
  { href: "/owner/profile", label: "My Profile", icon: User },
] as const;

interface OwnerPanelShellProps {
  session: OwnerSession | null;
  children: React.ReactNode;
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
      {NAV_LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Icon className="w-4 h-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function OwnerPanelShell({ session, children }: OwnerPanelShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text)]"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <SiteLogoStack
          href="/owner/dashboard"
          size="sm"
          // caption="Owner Portal"
          captionClassName="text-[var(--text-muted)]"
          darkBackground
        />
      </header>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar — drawer on mobile, fixed on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-[#0B2545] text-white transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5 lg:block">
          <SiteLogoStack
            href="/owner/dashboard"
            size="sm"
            // caption="Owner Portal"
            captionClassName="text-[#8ba0b8]"
            onClick={closeMobile}
          />
          <button
            type="button"
            onClick={closeMobile}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {session && (
          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2.5 px-3 text-xs">
              {session.businessCategory === "fighting_club" ? (
                <Swords className="w-4 h-4 shrink-0 text-[#FF6A3D]" />
              ) : (
                <Building2 className="w-4 h-4 shrink-0 text-blue-300" />
              )}
              <span className="truncate text-[#8ba0b8]">
                {businessCategoryLabel(session.businessCategory)}
              </span>
            </div>
          </div>
        )}

        <SidebarNav onNavigate={closeMobile} />

        <div className="space-y-1 border-t border-white/10 p-4">
          <Link
            href="/"
            onClick={closeMobile}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#8ba0b8] transition-colors hover:bg-white/10 hover:text-white"
          >
            ← Back to site
          </Link>
          <OwnerLogoutButton />
        </div>
      </aside>

      <main className="min-h-screen min-w-0 pt-14 lg:ml-60 lg:pt-0 max-lg:overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

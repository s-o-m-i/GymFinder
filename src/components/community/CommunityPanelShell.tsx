"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Menu, Trophy, X } from "lucide-react";
import { SiteLogoStack } from "@/components/layout/SiteLogo";
import { CommunityLogoutButton } from "@/components/community/CommunityLogoutButton";

interface CommunityPanelShellProps {
  fullName: string;
  children: React.ReactNode;
}

export function CommunityPanelShell({ fullName, children }: CommunityPanelShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text)]"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <SiteLogoStack href="/user/dashboard/success-stories" size="sm" darkBackground />
      </header>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-[#0B2545] text-white transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5 lg:block">
          <SiteLogoStack
            href="/user/dashboard/success-stories"
            size="sm"
            captionClassName="text-[#8ba0b8]"
            onClick={() => setMobileOpen(false)}
          />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-white/10 px-4 py-3">
          <p className="truncate px-3 text-xs text-[#8ba0b8]">{fullName}</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <Link
            href="/user/dashboard/success-stories"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Trophy className="h-4 w-4 shrink-0" />
            My Success Stories
          </Link>
          <Link
            href="/success-stories"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Browse stories
          </Link>
        </nav>

        <div className="space-y-1 border-t border-white/10 p-4">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#8ba0b8] transition-colors hover:bg-white/10 hover:text-white"
          >
            ← Back to site
          </Link>
          <CommunityLogoutButton />
        </div>
      </aside>

      <main className="min-h-screen min-w-0 pt-14 lg:ml-60 lg:pt-0 max-lg:overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

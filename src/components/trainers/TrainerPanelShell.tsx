"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dumbbell,
  ExternalLink,
  HelpCircle,
  LayoutDashboard,
  Menu,
  User,
  UserCircle,
  X,
} from "lucide-react";
import { TrainerNavLink } from "@/components/trainers/TrainerNavLink";
import { TrainerLogoutButton } from "@/components/trainers/TrainerLogoutButton";

interface TrainerPanelShellProps {
  roleLabel: string;
  publicProfileSlug?: string | null;
  children: React.ReactNode;
}

function SidebarContent({
  roleLabel,
  publicProfileSlug,
  onNavigate,
}: {
  roleLabel: string;
  publicProfileSlug?: string | null;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 text-xs">
          <UserCircle className="h-3.5 w-3.5 shrink-0 text-[#FF6A3D]" />
          <span className="truncate text-[#8ba0b8]">{roleLabel}</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <TrainerNavLink
          href="/trainer/dashboard"
          exact
          icon={<LayoutDashboard className="w-4 h-4" />}
          label="Dashboard"
          onNavigate={onNavigate}
        />
        <TrainerNavLink
          href="/trainer/dashboard/profile"
          icon={<User className="w-4 h-4" />}
          label="My Profile"
          onNavigate={onNavigate}
        />
        <TrainerNavLink
          href="/trainer/dashboard/faqs"
          icon={<HelpCircle className="w-4 h-4" />}
          label="FAQs"
          onNavigate={onNavigate}
        />
        {publicProfileSlug && (
          <Link
            href={`/trainer/${publicProfileSlug}`}
            target="_blank"
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            Public Profile
          </Link>
        )}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-4">
        <Link
          href="/trainers"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#8ba0b8] transition-colors hover:bg-white/10 hover:text-white"
        >
          ← Browse trainers
        </Link>
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#8ba0b8] transition-colors hover:bg-white/10 hover:text-white"
        >
          ← Back to site
        </Link>
        <TrainerLogoutButton />
      </div>
    </>
  );
}

export function TrainerPanelShell({
  roleLabel,
  publicProfileSlug,
  children,
}: TrainerPanelShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text)]"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/trainer/dashboard" className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF6A3D]">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-heading text-sm font-bold leading-tight text-[var(--text)]">
              FitnessAdda PK
            </div>
            <div className="truncate text-xs text-[var(--text-muted)]">Trainer Portal</div>
          </div>
        </Link>
      </header>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
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
          <Link href="/trainer/dashboard" className="flex items-center gap-2" onClick={closeMobile}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6A3D]">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-heading text-sm font-bold leading-tight">FitnessAdda PK</div>
              <div className="text-xs text-[#8ba0b8]">Trainer Portal</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={closeMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <SidebarContent
          roleLabel={roleLabel}
          publicProfileSlug={publicProfileSlug}
          onNavigate={closeMobile}
        />
      </aside>

      <main className="min-h-screen min-w-0 pt-14 lg:ml-60 lg:pt-0 max-lg:overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

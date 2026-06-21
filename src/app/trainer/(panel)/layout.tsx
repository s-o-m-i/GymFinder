export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Dumbbell,
  LayoutDashboard,
  User,
  UserCircle,
  ExternalLink,
} from "lucide-react";
import { getTrainerSession } from "@/lib/trainer-auth";
import { prisma } from "@/lib/prisma";
import { TrainerNavLink } from "@/components/trainers/TrainerNavLink";
import { TrainerLogoutButton } from "@/components/trainers/TrainerLogoutButton";
import { specializationLabel } from "@/lib/trainer-constants";

export const metadata: Metadata = {
  title: "Trainer Portal | GymFinder PK",
  robots: { index: false, follow: false },
};

export default async function TrainerPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getTrainerSession();
  if (!session) redirect("/trainer/auth?from=/trainer/dashboard");

  const account = await prisma.trainerAccount.findUnique({
    where: { id: session.accountId },
    include: {
      trainer: {
        select: {
          fullName: true,
          specialization: true,
          slug: true,
          isPublished: true,
        },
      },
    },
  });

  if (!account) redirect("/trainer/auth");

  const trainer = account.trainer;
  const roleLabel = trainer
    ? specializationLabel(trainer.specialization)
    : "Trainer Account";

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-[#0B2545] text-white">
        <div className="p-5 border-b border-white/10">
          <Link href="/trainer/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF6A3D] rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-heading font-bold text-sm leading-tight">GymFinder PK</div>
              <div className="text-xs text-[#8ba0b8]">Trainer Portal</div>
            </div>
          </Link>
        </div>

        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs">
            <UserCircle className="w-3.5 h-3.5 text-[#FF6A3D]" />
            <span className="text-[#8ba0b8] truncate">{roleLabel}</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <TrainerNavLink
            href="/trainer/dashboard"
            exact
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
          />
          <TrainerNavLink
            href="/trainer/dashboard/profile"
            icon={<User className="w-4 h-4" />}
            label="My Profile"
          />
          {trainer?.isPublished && (
            <Link
              href={`/trainer/${trainer.slug}`}
              target="_blank"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Public Profile
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link
            href="/trainers"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#8ba0b8] hover:text-white hover:bg-white/10 transition-colors"
          >
            ← Browse trainers
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#8ba0b8] hover:text-white hover:bg-white/10 transition-colors"
          >
            ← Back to site
          </Link>
          <TrainerLogoutButton />
        </div>
      </aside>

      <main className="ml-60 min-h-screen">{children}</main>
    </div>
  );
}

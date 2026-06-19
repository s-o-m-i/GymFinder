export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Users, Building2, Swords } from "lucide-react";
import { AdminOwnersTable } from "@/components/admin/AdminOwnersTable";

async function getOwners() {
  return prisma.gymOwner.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      businessCategory: true,
      createdAt: true,
      gym: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          customTypeLabel: true,
          area: true,
          city: true,
          priceMin: true,
          priceMax: true,
          listingStatus: true,
        },
      },
    },
  });
}

async function getStats() {
  const [total, gymOwners, fightingClubOwners, withListing, pending] = await Promise.all([
    prisma.gymOwner.count(),
    prisma.gymOwner.count({ where: { businessCategory: "gym" } }),
    prisma.gymOwner.count({ where: { businessCategory: "fighting_club" } }),
    prisma.gymOwner.count({ where: { gym: { isNot: null } } }),
    prisma.gym.count({ where: { listingStatus: "pending" } }),
  ]);
  return { total, gymOwners, fightingClubOwners, withListing, pending };
}

export default async function AdminOwnersPage() {
  const [owners, stats] = await Promise.all([getOwners(), getStats()]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Registered Owners</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Gym owners and fighting club owners who registered on the platform
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase text-[var(--text-muted)] mb-1">Total Owners</div>
          <div className="font-mono-nums font-bold text-2xl text-[var(--text)]">{stats.total}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <div className="flex items-center gap-1 text-xs font-semibold uppercase text-blue-600 mb-1">
            <Building2 className="w-3 h-3" /> Gym Owners
          </div>
          <div className="font-mono-nums font-bold text-2xl text-blue-700">{stats.gymOwners}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <div className="flex items-center gap-1 text-xs font-semibold uppercase text-orange-600 mb-1">
            <Swords className="w-3 h-3" /> Fighting Clubs
          </div>
          <div className="font-mono-nums font-bold text-2xl text-orange-700">{stats.fightingClubOwners}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase text-[var(--text-muted)] mb-1">With Listing</div>
          <div className="font-mono-nums font-bold text-2xl text-[var(--text)]">{stats.withListing}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase text-amber-600 mb-1">Pending Review</div>
          <div className="font-mono-nums font-bold text-2xl text-amber-700">{stats.pending}</div>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--text-muted)]" />
          <h2 className="font-heading font-bold text-[var(--text)]">All Registered Owners</h2>
        </div>
        <AdminOwnersTable owners={owners} />
      </div>
    </div>
  );
}

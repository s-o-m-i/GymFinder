export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PlusCircle } from "lucide-react";
import { AdminGymsTable } from "@/components/admin/AdminGymsTable";

async function getStats() {
  const [total, featured, byCity] = await Promise.all([
    prisma.gym.count(),
    prisma.gym.count({ where: { featured: true } }),
    prisma.gym.groupBy({ by: ["city"], _count: { id: true } }),
  ]);
  return { total, featured, byCity };
}

async function getAllGyms() {
  return prisma.gym.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      area: true,
      city: true,
      type: true,
      priceMin: true,
      priceMax: true,
      featured: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

export default async function AdminDashboard() {
  const [stats, gyms] = await Promise.all([getStats(), getAllGyms()]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Dashboard</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage your gym listings</p>
        </div>
        <Link
          href="/admin/add-gym"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Gym
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">Total Gyms</div>
          <div className="font-mono-nums font-bold text-3xl text-[var(--text)]">{stats.total}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">Featured</div>
          <div className="font-mono-nums font-bold text-3xl text-[#FF6A3D]">{stats.featured}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-2">By City</div>
          <div className="space-y-1">
            {stats.byCity.map((c) => (
              <div key={c.city} className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">{c.city}</span>
                <span className="font-mono-nums font-semibold text-[var(--text)]">{c._count.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[var(--border)]">
          <h2 className="font-heading font-bold text-[var(--text)]">All Listings</h2>
        </div>
        <AdminGymsTable gyms={gyms} />
      </div>
    </div>
  );
}

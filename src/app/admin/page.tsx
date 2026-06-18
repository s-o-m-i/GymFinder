export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PlusCircle, Edit, Star, MapPin } from "lucide-react";
import { gymTypeLabel, formatPriceShort } from "@/lib/utils";
import { GymTypeIcon } from "@/components/ui/GymTypeIcon";
import { DeleteGymButton } from "@/components/admin/DeleteGymButton";

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
    include: {
      images: { take: 1, select: { url: true } },
      disciplines: { include: { discipline: { select: { name: true } } } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

export default async function AdminDashboard() {
  const [stats, gyms] = await Promise.all([getStats(), getAllGyms()]);

  return (
    <div className="p-8">
      {/* Header */}
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

      {/* Stats */}
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

      {/* Gym table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[var(--border)]">
          <h2 className="font-heading font-bold text-[var(--text)]">All Listings</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                <th className="text-left px-5 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wide">Gym</th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wide">City / Area</th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gyms.map((gym) => (
                <tr key={gym.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors last:border-0">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[var(--text)]">{gym.name}</div>
                    <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{gym.slug}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-[var(--text-muted)]">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {gym.area}, {gym.city}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 text-[var(--text)]">
                      <GymTypeIcon type={gym.type} className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      {gymTypeLabel(gym.type)}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono-nums text-[var(--text)]">
                    {formatPriceShort(gym.priceMin, gym.priceMax)}
                  </td>
                  <td className="px-4 py-4">
                    {gym.featured ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">Standard</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/gyms/${gym.slug}`}
                        className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg)] transition-colors"
                        target="_blank"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/edit-gym/${gym.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[var(--navy)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg)] transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Link>
                      <DeleteGymButton gymId={gym.id} gymName={gym.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {gyms.length === 0 && (
            <div className="p-12 text-center text-[var(--text-muted)]">
              <p className="text-lg mb-2">No gyms yet</p>
              <Link
                href="/admin/add-gym"
                className="text-[#FF6A3D] font-semibold hover:underline"
              >
                Add your first gym →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

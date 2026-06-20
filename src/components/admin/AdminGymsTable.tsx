"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit, Star, MapPin, Trash2, BarChart3 } from "lucide-react";
import { GymTypeIcon } from "@/components/ui/GymTypeIcon";
import { gymTypeLabel, formatPriceShort } from "@/lib/utils";

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "gymfinder-admin-2024";

export interface AdminGymRow {
  id:       string;
  name:     string;
  slug:     string;
  area:     string;
  city:     string;
  type:             string;
  customTypeLabel?: string | null;
  priceMin: number;
  priceMax: number;
  featured: boolean;
}

interface AdminGymsTableProps {
  gyms: AdminGymRow[];
}

function DeleteButton({ gymId, gymName, onDeleted }: { gymId: string; gymName: string; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${gymName}"? This action cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gyms/${gymId}`, {
        method: "DELETE",
        headers: { "x-admin-secret": ADMIN_SECRET },
      });
      if (res.ok) onDeleted();
      else alert("Failed to delete gym.");
    } catch {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Trash2 className="w-3 h-3" />
      )}
      Delete
    </button>
  );
}

export function AdminGymsTable({ gyms }: AdminGymsTableProps) {
  const router = useRouter();

  if (gyms.length === 0) {
    return (
      <div className="p-12 text-center text-[var(--text-muted)]">
        <p className="text-lg mb-2">No gyms yet</p>
        <Link href="/admin/add-gym" className="text-[#FF6A3D] font-semibold hover:underline">
          Add your first gym →
        </Link>
      </div>
    );
  }

  return (
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
                  {gymTypeLabel(gym.type, gym.customTypeLabel)}
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
                    href={`/admin/analytics/${gym.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#0B2545] border border-[var(--border)] rounded-lg hover:bg-[var(--bg)] transition-colors"
                    title="Analytics"
                  >
                    <BarChart3 className="w-3 h-3" />
                    Stats
                  </Link>
                  <Link
                    href={`/admin/edit-gym/${gym.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[var(--navy)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg)] transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Link>
                  <DeleteButton gymId={gym.id} gymName={gym.name} onDeleted={() => router.refresh()} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

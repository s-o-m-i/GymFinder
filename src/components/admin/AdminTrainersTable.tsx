"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Edit,
  ExternalLink,
  EyeOff,
  Eye,
  Star,
  BadgeCheck,
  Filter,
  ArrowUpDown,
  UserRound,
} from "lucide-react";
import { specializationLabel } from "@/lib/trainer-constants";
import { cn } from "@/lib/utils";

export interface AdminTrainerRow {
  id: string;
  fullName: string;
  slug: string;
  city: string;
  area: string | null;
  specialization: string | null;
  isPublished: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  rating: number | null;
  totalReviews: number;
  whatsappNumber: string | null;
  createdAt: Date | string;
  gym: { id: string; name: string } | null;
  account: { email: string } | null;
}

type StatusFilter = "all" | "published" | "disabled";
type SortOption = "newest" | "oldest" | "name_asc" | "name_desc" | "rating";

const selectClass =
  "px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]";

function sortTrainers(list: AdminTrainerRow[], sortBy: SortOption): AdminTrainerRow[] {
  const sorted = [...list];
  sorted.sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name_asc":
        return a.fullName.localeCompare(b.fullName);
      case "name_desc":
        return b.fullName.localeCompare(a.fullName);
      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  return sorted;
}

function StatusToggle({
  trainerId,
  field,
  value,
  onUpdated,
}: {
  trainerId: string;
  field: "isPublished" | "isVerified" | "isFeatured";
  value: boolean;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trainers/${trainerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !value }),
      });
      if (res.ok) onUpdated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50",
        value
          ? field === "isPublished"
            ? "bg-green-50 text-green-700 hover:bg-green-100"
            : field === "isVerified"
              ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      )}
      title={`Toggle ${field}`}
    >
      {field === "isPublished" && (value ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />)}
      {field === "isVerified" && <BadgeCheck className="w-3 h-3" />}
      {field === "isFeatured" && <Star className="w-3 h-3" />}
      {field === "isPublished" && (value ? "Live" : "Disabled")}
      {field === "isVerified" && (value ? "Verified" : "Unverified")}
      {field === "isFeatured" && (value ? "Featured" : "Standard")}
    </button>
  );
}

export function AdminTrainersTable({ trainers }: { trainers: AdminTrainerRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    let list = trainers;

    if (statusFilter === "published") list = list.filter((t) => t.isPublished);
    if (statusFilter === "disabled") list = list.filter((t) => !t.isPublished);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.fullName.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) ||
          (t.area?.toLowerCase().includes(q) ?? false) ||
          (t.gym?.name.toLowerCase().includes(q) ?? false) ||
          (t.account?.email.toLowerCase().includes(q) ?? false)
      );
    }

    return sortTrainers(list, sortBy);
  }, [trainers, search, statusFilter, sortBy]);

  if (trainers.length === 0) {
    return (
      <div className="p-12 text-center text-[var(--text-muted)]">
        <UserRound className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-lg mb-2">No trainers yet</p>
        <Link href="/admin/trainers/add" className="text-[#FF6A3D] font-semibold hover:underline">
          Add your first trainer →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search name, city, gym, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30"
        />
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className={cn(selectClass, "pl-8")}
            >
              <option value="all">All status</option>
              <option value="published">Published</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={cn(selectClass, "pl-8")}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
              <th className="text-left px-5 py-3 font-semibold text-[var(--text-muted)]">Trainer</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--text-muted)]">Location</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--text-muted)]">Specialization</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--text-muted)]">Status</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--text-muted)]">Rating</th>
              <th className="text-right px-5 py-3 font-semibold text-[var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((trainer) => (
              <tr key={trainer.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)]/50">
                <td className="px-5 py-4">
                  <div className="font-semibold text-[var(--text)]">{trainer.fullName}</div>
                  {trainer.gym && (
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{trainer.gym.name}</div>
                  )}
                  {trainer.account?.email && (
                    <div className="text-xs text-[var(--text-muted)]">{trainer.account.email}</div>
                  )}
                </td>
                <td className="px-5 py-4 text-[var(--text-muted)]">
                  {trainer.area ? `${trainer.area}, ` : ""}
                  {trainer.city}
                </td>
                <td className="px-5 py-4 text-[var(--text-muted)]">
                  {specializationLabel(trainer.specialization)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    <StatusToggle
                      trainerId={trainer.id}
                      field="isPublished"
                      value={trainer.isPublished}
                      onUpdated={() => router.refresh()}
                    />
                    <StatusToggle
                      trainerId={trainer.id}
                      field="isVerified"
                      value={trainer.isVerified}
                      onUpdated={() => router.refresh()}
                    />
                    <StatusToggle
                      trainerId={trainer.id}
                      field="isFeatured"
                      value={trainer.isFeatured}
                      onUpdated={() => router.refresh()}
                    />
                  </div>
                </td>
                <td className="px-5 py-4 font-mono-nums text-[var(--text-muted)]">
                  {trainer.rating != null ? `${trainer.rating.toFixed(1)} (${trainer.totalReviews})` : "—"}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {trainer.isPublished && (
                      <Link
                        href={`/trainer/${trainer.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[#FF6A3D] hover:bg-[#FF6A3D]/10"
                        title="View public profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/trainers/${trainer.id}/edit`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#0B2545] border border-[var(--border)] rounded-lg hover:border-[#FF6A3D]/40 hover:bg-[#FF6A3D]/5 transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-[var(--text-muted)] text-sm">
          No trainers match your filters.
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Building2,
  Swords,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Filter,
  BarChart3,
} from "lucide-react";
import { businessCategoryBadgeClass, BUSINESS_CATEGORY_SHORT } from "@/lib/owner-constants";
import { gymTypeLabel, formatPriceShort, formatRegistrationDate } from "@/lib/utils";
import type { BusinessCategory, ListingStatus } from "@prisma/client";

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "gymfinder-admin-2024";

type CategoryFilter = "all" | "gym" | "fighting_club";
type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

export interface AdminOwnerRow {
  id:               string;
  name:             string;
  email:            string;
  phone:            string | null;
  businessCategory: BusinessCategory;
  createdAt:        Date | string;
  gym: {
    id:            string;
    name:          string;
    slug:          string;
    type:          string;
    customTypeLabel?: string | null;
    area:          string;
    city:          string;
    priceMin:      number;
    priceMax:      number;
    listingStatus: ListingStatus;
  } | null;
}

const selectClass =
  "px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]";

function ListingActions({ gymId, status }: { gymId: string; status: ListingStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(newStatus: ListingStatus) {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/gyms/${gymId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-secret": ADMIN_SECRET },
        body: JSON.stringify({ listingStatus: newStatus }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {status !== "approved" && (
        <button
          onClick={() => updateStatus("approved")}
          disabled={!!loading}
          title="Approve"
          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>
      )}
      {status !== "rejected" && (
        <button
          onClick={() => updateStatus("rejected")}
          disabled={!!loading}
          title="Reject"
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ListingStatus }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

function sortOwners(list: AdminOwnerRow[], sortBy: SortOption): AdminOwnerRow[] {
  const sorted = [...list];
  sorted.sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name_asc":
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      case "name_desc":
        return b.name.localeCompare(a.name, undefined, { sensitivity: "base" });
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  return sorted;
}

export function AdminOwnersTable({ owners }: { owners: AdminOwnerRow[] }) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const visibleOwners = useMemo(() => {
    const filtered =
      categoryFilter === "all"
        ? owners
        : owners.filter((owner) => owner.businessCategory === categoryFilter);
    return sortOwners(filtered, sortBy);
  }, [owners, categoryFilter, sortBy]);

  if (owners.length === 0) {
    return (
      <div className="px-5 py-12 text-center text-[var(--text-muted)]">
        No owners registered yet.
      </div>
    );
  }

  return (
    <>
      <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg)] flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="min-w-[180px]">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[var(--text-muted)] mb-1.5">
              <Filter className="w-3.5 h-3.5" />
              Account Type
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
              className={`${selectClass} w-full`}
            >
              <option value="all">All owners</option>
              <option value="gym">Gym owners</option>
              <option value="fighting_club">Fighting club owners</option>
            </select>
          </div>

          <div className="min-w-[180px]">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[var(--text-muted)] mb-1.5">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={`${selectClass} w-full`}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] sm:pb-2">
          Showing {visibleOwners.length} of {owners.length}
        </p>
      </div>

      {visibleOwners.length === 0 ? (
        <div className="px-5 py-12 text-center text-[var(--text-muted)]">
          No owners match the selected filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Account Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Registered</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Listing</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleOwners.map((owner) => (
                <tr key={owner.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)] last:border-0">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[var(--text)]">{owner.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{owner.email}</div>
                    {owner.phone && <div className="text-xs text-[var(--text-muted)]">{owner.phone}</div>}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${businessCategoryBadgeClass(owner.businessCategory)}`}>
                      {owner.businessCategory === "fighting_club" ? <Swords className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                      {BUSINESS_CATEGORY_SHORT[owner.businessCategory]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-[var(--text)] whitespace-nowrap">
                      {formatRegistrationDate(owner.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {owner.gym ? (
                      <div>
                        <Link href={`/admin/edit-gym/${owner.gym.id}`} className="font-medium text-[var(--text)] hover:text-[#FF6A3D]">
                          {owner.gym.name}
                        </Link>
                        <div className="text-xs text-[var(--text-muted)]">{owner.gym.area}, {owner.gym.city}</div>
                        <div className="text-xs font-mono-nums text-[var(--text-muted)]">
                          {formatPriceShort(owner.gym.priceMin, owner.gym.priceMax)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)] italic">No listing yet</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-[var(--text)]">
                    {owner.gym ? gymTypeLabel(owner.gym.type, owner.gym.customTypeLabel) : "—"}
                  </td>
                  <td className="px-4 py-4">
                    {owner.gym ? <StatusBadge status={owner.gym.listingStatus} /> : <span className="text-xs text-[var(--text-muted)]">—</span>}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {owner.gym && (
                        <Link
                          href={`/admin/analytics/${owner.gym.id}`}
                          title="View analytics"
                          className="p-1.5 rounded-lg text-[#0B2545] hover:bg-[#0B2545]/10"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Link>
                      )}
                      {owner.gym && <ListingActions gymId={owner.gym.id} status={owner.gym.listingStatus} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

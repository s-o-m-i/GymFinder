"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, Swords, Clock, CheckCircle2, XCircle } from "lucide-react";
import { businessCategoryBadgeClass, BUSINESS_CATEGORY_SHORT } from "@/lib/owner-constants";
import { gymTypeLabel, formatPriceShort } from "@/lib/utils";
import type { BusinessCategory, ListingStatus } from "@prisma/client";

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "gymfinder-admin-2024";

export interface AdminOwnerRow {
  id:               string;
  name:             string;
  email:            string;
  phone:            string | null;
  businessCategory: BusinessCategory;
  gym: {
    id:            string;
    name:          string;
    slug:          string;
    type:          string;
    area:          string;
    city:          string;
    priceMin:      number;
    priceMax:      number;
    listingStatus: ListingStatus;
  } | null;
}

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

export function AdminOwnersTable({ owners }: { owners: AdminOwnerRow[] }) {
  if (owners.length === 0) {
    return (
      <div className="px-5 py-12 text-center text-[var(--text-muted)]">
        No owners registered yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
            <th className="text-left px-5 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Owner</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Account Type</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Listing</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Category</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Status</th>
            <th className="text-right px-5 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {owners.map((owner) => (
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
                {owner.gym ? gymTypeLabel(owner.gym.type) : "—"}
              </td>
              <td className="px-4 py-4">
                {owner.gym ? <StatusBadge status={owner.gym.listingStatus} /> : <span className="text-xs text-[var(--text-muted)]">—</span>}
              </td>
              <td className="px-4 py-4 text-right">
                {owner.gym && <ListingActions gymId={owner.gym.id} status={owner.gym.listingStatus} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

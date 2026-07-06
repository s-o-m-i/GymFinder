"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";
import type { GymClaimStatus } from "@prisma/client";
import { cn, formatRegistrationDate } from "@/lib/utils";
import {
  GYM_CLAIM_POSITION_LABELS,
  GYM_CLAIM_STATUS_LABELS,
  GYM_CLAIM_STATUS_STYLES,
} from "@/lib/gym-claim/constants";

export type AdminGymClaimRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  position: keyof typeof GYM_CLAIM_POSITION_LABELS;
  status: GymClaimStatus;
  submittedAt: Date | string;
  gym: { id: string; name: string; slug: string; city: string };
};

interface AdminGymClaimsTableProps {
  claims: AdminGymClaimRow[];
  cities: string[];
}

const selectClass =
  "rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[#FF6A3D] focus:outline-none";

export function AdminGymClaimsTable({ claims, cities }: AdminGymClaimsTableProps) {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<GymClaimStatus | "ALL">("ALL");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    let rows = [...claims];
    if (status !== "ALL") rows = rows.filter((r) => r.status === status);
    if (city) rows = rows.filter((r) => r.gym.city.toLowerCase() === city.toLowerCase());
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.fullName.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s) ||
          r.phone.includes(s) ||
          r.whatsapp.includes(s) ||
          r.gym.name.toLowerCase().includes(s)
      );
    }
    rows.sort((a, b) => {
      const ta = new Date(a.submittedAt).getTime();
      const tb = new Date(b.submittedAt).getTime();
      return sort === "oldest" ? ta - tb : tb - ta;
    });
    return rows;
  }, [claims, status, city, search, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 lg:flex-row lg:items-end">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
          }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search gym, applicant, phone, email..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-2.5 pl-10 pr-3 text-sm"
          />
        </form>
        <select value={status} onChange={(e) => setStatus(e.target.value as GymClaimStatus | "ALL")} className={selectClass}>
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")} className={selectClass}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-10 text-center text-sm text-[var(--text-muted)]">
          No claim requests match your filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  <th className="px-4 py-3 font-semibold">Gym Name</th>
                  <th className="px-4 py-3 font-semibold">Applicant</th>
                  <th className="px-4 py-3 font-semibold">Business Phone</th>
                  <th className="px-4 py-3 font-semibold">WhatsApp</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Position</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((claim) => (
                  <tr key={claim.id} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="px-4 py-4">
                      <div className="font-medium text-[var(--text)]">{claim.gym.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{claim.gym.city}</div>
                    </td>
                    <td className="px-4 py-4 text-[var(--text)]">{claim.fullName}</td>
                    <td className="px-4 py-4 text-[var(--text-muted)]">{claim.phone}</td>
                    <td className="px-4 py-4 text-[var(--text-muted)]">{claim.whatsapp}</td>
                    <td className="px-4 py-4 text-[var(--text-muted)]">{claim.email}</td>
                    <td className="px-4 py-4 text-[var(--text-muted)]">
                      {GYM_CLAIM_POSITION_LABELS[claim.position]}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                          GYM_CLAIM_STATUS_STYLES[claim.status]
                        )}
                      >
                        {GYM_CLAIM_STATUS_LABELS[claim.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[var(--text-muted)]">
                      {formatRegistrationDate(claim.submittedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/claims/${claim.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold hover:border-[#FF6A3D]/40"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

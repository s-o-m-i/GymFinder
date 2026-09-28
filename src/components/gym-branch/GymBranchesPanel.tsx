"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import {
  canDeleteGymBranch,
  getGymBranchPath,
  gymBranchStatusLabel,
  type GymBranchStatusValue,
} from "@/lib/gym-branch-rules";

export type GymBranchListItem = {
  id: string;
  name: string;
  slug: string;
  address: string;
  area: string;
  city: string;
  openingHours: string | null;
  status: GymBranchStatusValue;
  isPrimary: boolean;
};

type ActionResult = { success: true } | { success: false; error: string };

interface GymBranchesPanelProps {
  gymName: string;
  gymSlug: string;
  branches: GymBranchListItem[];
  addHref: string;
  editHref: (branchId: string) => string;
  onSetStatus: (branchId: string, status: GymBranchStatusValue) => Promise<ActionResult>;
  onSetPrimary: (branchId: string) => Promise<ActionResult>;
  onDelete: (branchId: string) => Promise<ActionResult>;
}

function statusClass(status: GymBranchStatusValue) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700";
    case "TEMPORARILY_CLOSED":
      return "bg-amber-50 text-amber-700";
    case "PERMANENTLY_CLOSED":
      return "bg-red-50 text-red-700";
  }
}

export function GymBranchesPanel({
  gymName,
  gymSlug,
  branches,
  addHref,
  editHref,
  onSetStatus,
  onSetPrimary,
  onDelete,
}: GymBranchesPanelProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(branchId: string, action: () => Promise<ActionResult>) {
    setError("");
    setPendingId(branchId);
    startTransition(async () => {
      const result = await action();
      setPendingId(null);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-[var(--border)] flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-bold text-[var(--text)]">Branches</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Physical locations for {gymName}
          </p>
        </div>
        <Link
          href={addHref}
          className="px-3 py-1.5 text-xs font-semibold bg-[#FF6A3D] text-white rounded-lg hover:bg-[#e85528] transition-colors"
        >
          Add Branch
        </Link>
      </div>

      {error && (
        <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {branches.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted)]">
          No branches yet. Add the first location for this gym.
        </div>
      ) : (
        <ol className="divide-y divide-[var(--border)]">
          {branches.map((branch, index) => {
            const deleteCheck = canDeleteGymBranch({
              isPrimary: branch.isPrimary,
              totalBranchCount: branches.length,
            });
            const busy = isPending && pendingId === branch.id;

            return (
              <li key={branch.id} className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono-nums text-[var(--text-muted)]">
                        {index + 1}.
                      </span>
                      <h3 className="font-heading font-bold text-[var(--text)]">
                        {branch.name}
                      </h3>
                      {branch.isPrimary && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3" />
                          Primary
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusClass(branch.status)}`}
                      >
                        {gymBranchStatusLabel(branch.status)}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-[var(--text-muted)] mt-2">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>
                        {branch.address}, {branch.area}, {branch.city}
                      </span>
                    </div>
                    {branch.openingHours && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1">
                        <Clock className="w-3 h-3" />
                        {branch.openingHours}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={getGymBranchPath(gymSlug, branch.slug)}
                      target="_blank"
                      className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg)]"
                    >
                      View
                    </Link>
                    <Link
                      href={editHref(branch.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[var(--navy)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg)]"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Link>
                    {branch.status !== "ACTIVE" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => run(branch.id, () => onSetStatus(branch.id, "ACTIVE"))}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Activate
                      </button>
                    )}
                    {branch.status !== "TEMPORARILY_CLOSED" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(branch.id, () =>
                            onSetStatus(branch.id, "TEMPORARILY_CLOSED")
                          )
                        }
                        className="px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50 disabled:opacity-50"
                      >
                        Temporarily Close
                      </button>
                    )}
                    {branch.status !== "PERMANENTLY_CLOSED" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(branch.id, () =>
                            onSetStatus(branch.id, "PERMANENTLY_CLOSED")
                          )
                        }
                        className="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        Permanently Close
                      </button>
                    )}
                    {!branch.isPrimary && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => run(branch.id, () => onSetPrimary(branch.id))}
                        className="px-3 py-1.5 text-xs font-medium text-[var(--text)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg)] disabled:opacity-50"
                      >
                        Make Primary
                      </button>
                    )}
                    {deleteCheck.ok ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (
                            !confirm(
                              `Delete "${branch.name}"? Closed branches should usually be closed, not deleted.`
                            )
                          ) {
                            return;
                          }
                          run(branch.id, () => onDelete(branch.id));
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

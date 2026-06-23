"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, ExternalLink, X } from "lucide-react";
import {
  approveFeatureRequestAction,
  rejectFeatureRequestAction,
} from "@/app/actions/admin/feature-requests";
import {
  FEATURE_REQUEST_STATUS_LABELS,
  FEATURE_REQUEST_STATUS_STYLES,
} from "@/lib/featured-gym";
import { formatPlanAmount } from "@/lib/featured-payment-config";
import { cn } from "@/lib/utils";

export type AdminFeatureRequestRow = {
  id: string;
  plan: string;
  amount: number;
  paymentMethod: string;
  transactionId: string | null;
  screenshotUrl: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  gym: { id: string; name: string; slug: string; city: string };
  gymOwner: { name: string; email: string } | null;
};

interface AdminFeaturedRequestsTableProps {
  requests: AdminFeatureRequestRow[];
}

export function AdminFeaturedRequestsTable({ requests }: AdminFeaturedRequestsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleAction(requestId: string, action: "approve" | "reject") {
    setMessage(null);
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveFeatureRequestAction(requestId)
          : await rejectFeatureRequestAction(requestId);

      setMessage(result.success ? `Request ${action}d.` : result.error);
    });
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-10 text-center text-sm text-[var(--text-muted)]">
        No featured promotion requests yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--text)]">
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
                <th className="px-4 py-3 font-semibold">Gym</th>
                <th className="px-4 py-3 font-semibold">Owner</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Txn ID</th>
                <th className="px-4 py-3 font-semibold">Screenshot</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="px-4 py-4">
                    <div className="font-medium text-[var(--text)]">{request.gym.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{request.gym.city}</div>
                  </td>
                  <td className="px-4 py-4 text-[var(--text-muted)]">
                    {request.gymOwner ? (
                      <>
                        <div>{request.gymOwner.name}</div>
                        <div className="text-xs">{request.gymOwner.email}</div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 capitalize">{request.plan}</td>
                  <td className="px-4 py-4">{formatPlanAmount(request.amount)}</td>
                  <td className="px-4 py-4 capitalize">{request.paymentMethod}</td>
                  <td className="px-4 py-4 font-mono-nums text-xs">{request.transactionId ?? "—"}</td>
                  <td className="px-4 py-4">
                    {request.screenshotUrl ? (
                      <div className="flex items-center gap-2">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-[var(--border)]">
                          <Image
                            src={request.screenshotUrl}
                            alt="Payment screenshot"
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <a
                          href={request.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A3D] hover:underline"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 text-[var(--text-muted)]">
                    {new Date(request.createdAt).toLocaleDateString("en-PK")}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                        FEATURE_REQUEST_STATUS_STYLES[request.status]
                      )}
                    >
                      {FEATURE_REQUEST_STATUS_LABELS[request.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {request.status === "pending" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleAction(request.id, "approve")}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleAction(request.id, "reject")}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

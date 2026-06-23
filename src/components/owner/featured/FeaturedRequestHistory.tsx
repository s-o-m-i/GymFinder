import {
  FEATURE_REQUEST_STATUS_LABELS,
  FEATURE_REQUEST_STATUS_STYLES,
  formatFeaturedUntil,
} from "@/lib/featured-gym";
import { formatPlanAmount } from "@/lib/featured-payment-config";
import { cn } from "@/lib/utils";
import type { FeatureRequest } from "@prisma/client";

interface FeaturedRequestHistoryProps {
  requests: FeatureRequest[];
  gymFeaturedUntil?: Date | null;
  gymFeaturedPlan?: string | null;
  isActivelyFeatured: boolean;
}

export function FeaturedRequestHistory({
  requests,
  gymFeaturedUntil,
  gymFeaturedPlan,
  isActivelyFeatured,
}: FeaturedRequestHistoryProps) {
  return (
    <div className="space-y-4">
      {isActivelyFeatured && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Your gym is currently <strong>featured</strong>
          {gymFeaturedPlan ? ` (${gymFeaturedPlan})` : ""}
          {gymFeaturedUntil ? ` until ${formatFeaturedUntil(gymFeaturedUntil)}` : ""}.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-[var(--text)]">My Promotion Requests</h2>
        </div>

        {requests.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
            No promotion requests yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-4 font-medium capitalize text-[var(--text)]">{request.plan}</td>
                    <td className="px-5 py-4 text-[var(--text-muted)]">{formatPlanAmount(request.amount)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                          FEATURE_REQUEST_STATUS_STYLES[request.status]
                        )}
                      >
                        {FEATURE_REQUEST_STATUS_LABELS[request.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[var(--text-muted)]">
                      {new Date(request.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

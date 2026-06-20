"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  MessageCircle,
  Phone,
  MapPin,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import type { AdminPlatformAnalyticsData } from "@/app/actions/admin/analytics";
import type { AnalyticsPeriod } from "@/lib/validations/analytics";
import { cn } from "@/lib/utils";

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "all", label: "All Time" },
];

interface AdminAnalyticsOverviewProps {
  data: AdminPlatformAnalyticsData;
  period: AnalyticsPeriod;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accent: string;
}) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </p>
          <p className="font-heading font-bold text-3xl text-[#0B2545] mt-2 tabular-nums">
            {value.toLocaleString()}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accent}18` }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

export function AdminAnalyticsOverview({ data, period }: AdminAnalyticsOverviewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setPeriod(next: AnalyticsPeriod) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", next);
    router.push(`/admin/analytics?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#FF6A3D] mb-2">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Platform Analytics
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-sm">
            Lead tracking across all owner listings
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer",
                period === p.value
                  ? "bg-[#0B2545] text-white border-[#0B2545]"
                  : "bg-[var(--card)] text-[var(--text-muted)] border-[var(--border)] hover:border-[#FF6A3D]/40"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Profile Views" value={data.summary.profileViews} icon={Eye} accent="#0B2545" />
        <StatCard label="WhatsApp Clicks" value={data.summary.whatsappClicks} icon={MessageCircle} accent="#25D366" />
        <StatCard label="Phone Clicks" value={data.summary.phoneClicks} icon={Phone} accent="#FF6A3D" />
        <StatCard label="Directions Clicks" value={data.summary.directionsClicks} icon={MapPin} accent="#3B82F6" />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[var(--border)]">
          <h2 className="font-heading font-bold text-[var(--text)]">Analytics by Listing</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Click a row to view detailed charts for that gym
          </p>
        </div>

        {data.leaderboard.length === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--text-muted)]">
            No analytics events recorded for this period yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Gym</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Owner</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Views</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">WhatsApp</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Phone</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Directions</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.leaderboard.map((row) => (
                  <tr key={row.gymId} className="border-b border-[var(--border)] hover:bg-[var(--bg)] last:border-0">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[var(--text)]">{row.gymName}</div>
                      <div className="text-xs text-[var(--text-muted)]">{row.area}, {row.city}</div>
                    </td>
                    <td className="px-4 py-4">
                      {row.ownerName ? (
                        <>
                          <div className="text-[var(--text)]">{row.ownerName}</div>
                          <div className="text-xs text-[var(--text-muted)]">{row.ownerEmail}</div>
                        </>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)] italic">Admin listing</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right font-mono-nums tabular-nums">{row.profileViews}</td>
                    <td className="px-4 py-4 text-right font-mono-nums tabular-nums">{row.whatsappClicks}</td>
                    <td className="px-4 py-4 text-right font-mono-nums tabular-nums">{row.phoneClicks}</td>
                    <td className="px-4 py-4 text-right font-mono-nums tabular-nums">{row.directionsClicks}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/analytics/${row.gymId}?period=${period}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A3D] hover:underline"
                      >
                        Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
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

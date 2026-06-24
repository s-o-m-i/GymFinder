"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  MessageCircle,
  Phone,
  MapPin,
  TrendingUp,
  Trophy,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { OwnerAnalyticsData } from "@/app/actions/owner/analytics";
import type { GymAnalyticsViewData } from "@/services/analytics-query.service";
import type { AnalyticsPeriod } from "@/lib/validations/analytics";
import { cn } from "@/lib/utils";

export type GymAnalyticsPanelData = OwnerAnalyticsData | GymAnalyticsViewData;

interface OwnerAnalyticsSectionProps {
  data: GymAnalyticsPanelData;
  period: AnalyticsPeriod;
  /** Base URL for period filter navigation (no query string) */
  periodBasePath?: string;
  /** Extra query params preserved when changing period (e.g. tab=analytics) */
  periodSearchParams?: Record<string, string>;
  showTopPerforming?: boolean;
}

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "all", label: "All Time" },
];

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
          <p className="font-heading font-bold text-2xl sm:text-3xl text-[#0B2545] mt-2 tabular-nums">
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

function formatChartDate(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-PK", { month: "short", day: "numeric" });
}

export function OwnerAnalyticsSection({
  data,
  period,
  periodBasePath = "/owner/dashboard",
  periodSearchParams = { tab: "analytics" },
  showTopPerforming = "topPerforming" in data && "hasMultipleGyms" in data
    ? data.hasMultipleGyms
    : false,
}: OwnerAnalyticsSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setPeriod(next: AnalyticsPeriod) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(periodSearchParams)) {
      params.set(key, value);
    }
    params.set("period", next);
    router.push(`${periodBasePath}?${params.toString()}`);
  }

  const topPerforming =
    "topPerforming" in data ? data.topPerforming : { mostViewed: null, mostContacted: null };

  const chartData = data.dailySeries.map((point) => ({
    ...point,
    label: formatChartDate(point.date),
  }));

  const totalClicks =
    data.summary.whatsappClicks +
    data.summary.phoneClicks +
    data.summary.directionsClicks;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[var(--text-muted)] text-sm">
            Anonymous visitor insights for{" "}
            <span className="font-semibold text-[var(--text)]">{data.gymName}</span>
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
        <StatCard
          label="Profile Views"
          value={data.summary.profileViews}
          icon={Eye}
          accent="#0B2545"
        />
        <StatCard
          label="WhatsApp Clicks"
          value={data.summary.whatsappClicks}
          icon={MessageCircle}
          accent="#25D366"
        />
        <StatCard
          label="Phone Clicks"
          value={data.summary.phoneClicks}
          icon={Phone}
          accent="#FF6A3D"
        />
        <StatCard
          label="Directions Clicks"
          value={data.summary.directionsClicks}
          icon={MapPin}
          accent="#3B82F6"
        />
      </div>

      {showTopPerforming &&
        (topPerforming.mostViewed || topPerforming.mostContacted) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topPerforming.mostViewed && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                <div className="flex items-center gap-2 text-[#0B2545] mb-2">
                  <Trophy className="w-4 h-4 text-[#FF6A3D]" />
                  <h3 className="font-heading font-bold text-sm">Most Viewed Gym</h3>
                </div>
                <p className="font-semibold text-[var(--text)]">
                  {topPerforming.mostViewed.name}
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {topPerforming.mostViewed.count.toLocaleString()} profile views
                </p>
              </div>
            )}
            {topPerforming.mostContacted && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                <div className="flex items-center gap-2 text-[#0B2545] mb-2">
                  <TrendingUp className="w-4 h-4 text-[#FF6A3D]" />
                  <h3 className="font-heading font-bold text-sm">Most Contacted Gym</h3>
                </div>
                <p className="font-semibold text-[var(--text)]">
                  {topPerforming.mostContacted.name}
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {topPerforming.mostContacted.count.toLocaleString()} contact clicks
                </p>
              </div>
            )}
          </div>
        )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <h3 className="font-heading font-bold text-[var(--text)] mb-1">
            Views Over Time
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">Daily profile views</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B2545" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0B2545" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="profileViews"
                  name="Views"
                  stroke="#0B2545"
                  fill="url(#viewsGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-[var(--text-muted)]">
              No views recorded for this period yet.
            </div>
          )}
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <h3 className="font-heading font-bold text-[var(--text)] mb-1">
            Clicks Over Time
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            WhatsApp, phone & directions ({totalClicks.toLocaleString()} total)
          </p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ left: 4, right: 16, top: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="whatsappClicks"
                  name="WhatsApp"
                  fill="#25D366"
                  radius={[0, 4, 4, 0]}
                  barSize={10}
                />
                <Bar
                  dataKey="phoneClicks"
                  name="Phone"
                  fill="#FF6A3D"
                  radius={[0, 4, 4, 0]}
                  barSize={10}
                />
                <Bar
                  dataKey="directionsClicks"
                  name="Directions"
                  fill="#3B82F6"
                  radius={[0, 4, 4, 0]}
                  barSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-[var(--text-muted)]">
              No clicks recorded for this period yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

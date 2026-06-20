export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getAdminPlatformAnalytics } from "@/app/actions/admin/analytics";
import { AdminAnalyticsOverview } from "@/components/admin/AdminAnalyticsOverview";
import { analyticsPeriodSchema } from "@/lib/validations/analytics";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) redirect("/admin/login");

  const { period: periodParam } = await searchParams;
  const periodResult = analyticsPeriodSchema.safeParse(periodParam ?? "30d");
  const period = periodResult.success ? periodResult.data : "30d";

  const data = await getAdminPlatformAnalytics(period);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Analytics</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Owner listing performance across the platform
        </p>
      </div>

      <Suspense fallback={<div className="text-sm text-[var(--text-muted)]">Loading analytics…</div>}>
        <AdminAnalyticsOverview data={data} period={period} />
      </Suspense>
    </div>
  );
}

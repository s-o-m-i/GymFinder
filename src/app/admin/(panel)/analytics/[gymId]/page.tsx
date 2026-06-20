export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { getAdminGymAnalytics } from "@/app/actions/admin/analytics";
import { OwnerAnalyticsSection } from "@/components/owner/analytics/OwnerAnalyticsSection";
import { analyticsPeriodSchema } from "@/lib/validations/analytics";

interface PageProps {
  params: Promise<{ gymId: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminGymAnalyticsPage({ params, searchParams }: PageProps) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) redirect("/admin/login");

  const { gymId } = await params;
  const { period: periodParam } = await searchParams;
  const periodResult = analyticsPeriodSchema.safeParse(periodParam ?? "30d");
  const period = periodResult.success ? periodResult.data : "30d";

  const data = await getAdminGymAnalytics(gymId, period);
  if (!data) notFound();

  return (
    <div className="p-8 max-w-6xl">
      <Link
        href={`/admin/analytics?period=${period}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[#FF6A3D] mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to all analytics
      </Link>

      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">{data.gymName}</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Listing analytics detail</p>
      </div>

      <Suspense fallback={<div className="text-sm text-[var(--text-muted)]">Loading charts…</div>}>
        <OwnerAnalyticsSection
          data={data}
          period={period}
          periodBasePath={`/admin/analytics/${gymId}`}
          periodSearchParams={{}}
          showTopPerforming={false}
        />
      </Suspense>
    </div>
  );
}

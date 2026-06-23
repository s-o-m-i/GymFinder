export const dynamic = "force-dynamic";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminFeaturedRequestsTable } from "@/components/admin/AdminFeaturedRequestsTable";
import {
  checkExpiredFeaturedGyms,
  getFeaturedPromotionAnalytics,
} from "@/services/featured/featured-gym.service";
import { formatPlanAmount } from "@/lib/featured-payment-config";

export default async function AdminFeaturedRequestsPage() {
  await checkExpiredFeaturedGyms();

  const [analytics, requests] = await Promise.all([
    getFeaturedPromotionAnalytics(),
    prisma.featureRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            owner: { select: { name: true, email: true } },
          },
        },
      },
    }),
  ]);

  const rows = requests.map((request) => ({
    id: request.id,
    plan: request.plan,
    amount: request.amount,
    paymentMethod: request.paymentMethod,
    transactionId: request.transactionId,
    screenshotUrl: request.screenshotUrl,
    status: request.status,
    createdAt: request.createdAt,
    gym: {
      id: request.gym.id,
      name: request.gym.name,
      slug: request.gym.slug,
      city: request.gym.city,
    },
    gymOwner: request.gym.owner,
  }));

  const statCards = [
    { label: "Pending Requests", value: analytics.pendingRequests },
    { label: "Approved Requests", value: analytics.approvedRequests },
    { label: "Active Featured Gyms", value: analytics.activeFeaturedGyms },
    { label: "Revenue Generated", value: formatPlanAmount(analytics.revenueGenerated) },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#FF6A3D]" />
            <h1 className="font-heading text-2xl font-bold text-[var(--text)]">Featured Requests</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            Review manual JazzCash / Easypaisa payments and activate featured listings.
          </p>
        </div>
        <Link
          href="/admin/featured-plans"
          className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] hover:border-[#FF6A3D]/40"
        >
          Manage Plans
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              {card.label}
            </p>
            <p className="font-heading mt-2 text-2xl font-bold text-[var(--text)]">{card.value}</p>
          </div>
        ))}
      </div>

      <AdminFeaturedRequestsTable requests={rows} />
    </div>
  );
}

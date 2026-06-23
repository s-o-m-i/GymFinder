import "server-only";

import { prisma } from "@/lib/prisma";
import { isGymActivelyFeatured } from "@/lib/featured-gym";

const REVALIDATE_PATHS = ["/", "/gyms", "/owner/featured", "/admin/featured-requests"];

/** Expire featured status for gyms past featuredUntil. */
export async function checkExpiredFeaturedGyms(now = new Date()) {
  const expired = await prisma.gym.findMany({
    where: {
      featured: true,
      featuredUntil: { lt: now },
    },
    select: { id: true, slug: true },
  });

  if (expired.length === 0) return { expiredCount: 0 };

  await prisma.gym.updateMany({
    where: {
      featured: true,
      featuredUntil: { lt: now },
    },
    data: {
      featured: false,
      featuredPlan: null,
    },
  });

  return { expiredCount: expired.length, slugs: expired.map((g) => g.slug) };
}

export async function activateFeaturedGym(params: {
  gymId: string;
  planSlug: string;
  durationDays: number;
  now?: Date;
}) {
  const now = params.now ?? new Date();
  const featuredUntil = new Date(now);
  featuredUntil.setDate(featuredUntil.getDate() + params.durationDays);

  return prisma.gym.update({
    where: { id: params.gymId },
    data: {
      featured: true,
      featuredAt: now,
      featuredUntil,
      featuredPlan: params.planSlug,
    },
    select: { id: true, slug: true, featuredUntil: true },
  });
}

export async function approveFeatureRequest(requestId: string, reviewedBy = "admin") {
  const now = new Date();

  const request = await prisma.featureRequest.findUnique({
    where: { id: requestId },
    include: {
      featuredPlan: true,
      gym: { select: { id: true, slug: true } },
    },
  });

  if (!request) throw new Error("REQUEST_NOT_FOUND");
  if (request.status !== "pending") throw new Error("REQUEST_NOT_PENDING");

  const durationDays = request.featuredPlan?.durationDays ?? (request.plan === "weekly" ? 7 : 30);
  const planSlug = request.featuredPlan?.slug ?? request.plan;

  await prisma.$transaction([
    prisma.featureRequest.update({
      where: { id: requestId },
      data: {
        status: "approved",
        reviewedAt: now,
        reviewedBy,
      },
    }),
    prisma.gym.update({
      where: { id: request.gymId },
      data: {
        featured: true,
        featuredAt: now,
        featuredUntil: new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000),
        featuredPlan: planSlug,
      },
    }),
  ]);

  return { gymSlug: request.gym.slug };
}

export async function rejectFeatureRequest(requestId: string, reviewedBy = "admin") {
  const request = await prisma.featureRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error("REQUEST_NOT_FOUND");
  if (request.status !== "pending") throw new Error("REQUEST_NOT_PENDING");

  await prisma.featureRequest.update({
    where: { id: requestId },
    data: {
      status: "rejected",
      reviewedAt: new Date(),
      reviewedBy,
    },
  });
}

export async function getFeaturedPromotionAnalytics() {
  await checkExpiredFeaturedGyms();

  const now = new Date();
  const [pendingRequests, approvedRequests, activeFeaturedGyms, revenueAgg] = await Promise.all([
    prisma.featureRequest.count({ where: { status: "pending" } }),
    prisma.featureRequest.count({ where: { status: "approved" } }),
    prisma.gym.count({
      where: {
        featured: true,
        OR: [{ featuredUntil: null }, { featuredUntil: { gt: now } }],
      },
    }),
    prisma.featureRequest.aggregate({
      where: { status: "approved" },
      _sum: { amount: true },
    }),
  ]);

  return {
    pendingRequests,
    approvedRequests,
    activeFeaturedGyms,
    revenueGenerated: revenueAgg._sum.amount ?? 0,
  };
}

export function gymShowsFeaturedBadge(gym: {
  featured: boolean;
  featuredUntil?: Date | null;
}) {
  return isGymActivelyFeatured(gym);
}

export { REVALIDATE_PATHS };

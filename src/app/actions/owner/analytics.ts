"use server";

import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import {
  analyticsPeriodSchema,
  type AnalyticsPeriod,
} from "@/lib/validations/analytics";
import {
  getAnalyticsSummary,
  getDailyAnalyticsSeries,
  getTopPerformingGymInsights,
  type AnalyticsSummary,
  type DailyAnalyticsPoint,
} from "@/services/analytics-query.service";
import { getGymLeadStats, type GymLeadStats } from "@/services/gym-lead.service";

export type OwnerAnalyticsData = {
  gymId: string;
  gymName: string;
  summary: AnalyticsSummary;
  dailySeries: DailyAnalyticsPoint[];
  topPerforming: Awaited<ReturnType<typeof getTopPerformingGymInsights>>;
  hasMultipleGyms: boolean;
  leads: GymLeadStats;
};

async function requireOwnerGym() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const owner = await prisma.gymOwner.findUnique({
    where: { id: session.ownerId },
    select: {
      gym: { select: { id: true, name: true } },
    },
  });

  if (!owner?.gym) redirect("/owner/gym");
  return { ownerId: session.ownerId, gym: owner.gym };
}

export async function getOwnerAnalytics(
  periodInput: string = "30d"
): Promise<OwnerAnalyticsData> {
  const periodResult = analyticsPeriodSchema.safeParse(periodInput);
  const period: AnalyticsPeriod = periodResult.success ? periodResult.data : "30d";

  const { ownerId, gym } = await requireOwnerGym();

  const [summary, dailySeries, topPerforming, gymCount, leads] = await Promise.all([
    getAnalyticsSummary(gym.id, period),
    getDailyAnalyticsSeries(gym.id, period),
    getTopPerformingGymInsights(ownerId),
    prisma.gym.count({ where: { ownerId } }),
    getGymLeadStats(gym.id, period),
  ]);

  return {
    gymId: gym.id,
    gymName: gym.name,
    summary,
    dailySeries,
    topPerforming,
    hasMultipleGyms: gymCount > 1,
    leads,
  };
}

"use server";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { analyticsPeriodSchema, type AnalyticsPeriod } from "@/lib/validations/analytics";
import {
  getPlatformAnalyticsSummary,
  getGymAnalyticsLeaderboard,
  getGymAnalyticsData,
  type AnalyticsSummary,
  type GymAnalyticsLeaderboardRow,
  type GymAnalyticsViewData,
} from "@/services/analytics-query.service";

async function requireAdmin() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) redirect("/admin/login");
}

export type AdminPlatformAnalyticsData = {
  summary: AnalyticsSummary;
  leaderboard: GymAnalyticsLeaderboardRow[];
};

export async function getAdminPlatformAnalytics(
  periodInput: string = "30d"
): Promise<AdminPlatformAnalyticsData> {
  await requireAdmin();
  const periodResult = analyticsPeriodSchema.safeParse(periodInput);
  const period: AnalyticsPeriod = periodResult.success ? periodResult.data : "30d";

  const [summary, leaderboard] = await Promise.all([
    getPlatformAnalyticsSummary(period),
    getGymAnalyticsLeaderboard(period),
  ]);

  return { summary, leaderboard };
}

export async function getAdminGymAnalytics(
  gymId: string,
  periodInput: string = "30d"
): Promise<GymAnalyticsViewData | null> {
  await requireAdmin();
  const periodResult = analyticsPeriodSchema.safeParse(periodInput);
  const period: AnalyticsPeriod = periodResult.success ? periodResult.data : "30d";
  return getGymAnalyticsData(gymId, period);
}

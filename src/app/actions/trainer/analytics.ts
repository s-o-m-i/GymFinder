"use server";

import { redirect } from "next/navigation";
import { getTrainerSession } from "@/lib/trainer-auth";
import { prisma } from "@/lib/prisma";
import {
  analyticsPeriodSchema,
  type AnalyticsPeriod,
} from "@/lib/validations/analytics";
import {
  getTrainerAnalyticsSummary,
  getTrainerDailyAnalyticsSeries,
  type TrainerAnalyticsSummary,
  type TrainerDailyAnalyticsPoint,
} from "@/services/trainer-analytics-query.service";

export type TrainerAnalyticsData = {
  trainerId: string;
  trainerName: string;
  summary: TrainerAnalyticsSummary;
  dailySeries: TrainerDailyAnalyticsPoint[];
};

async function requireTrainerProfile() {
  const session = await getTrainerSession();
  if (!session) redirect("/trainer/auth");

  const account = await prisma.trainerAccount.findUnique({
    where: { id: session.accountId },
    select: {
      trainer: { select: { id: true, fullName: true, isPublished: true } },
    },
  });

  if (!account?.trainer) redirect("/trainer/dashboard/profile");
  return account.trainer;
}

export async function getTrainerAnalytics(
  periodInput: string = "30d"
): Promise<TrainerAnalyticsData> {
  const periodResult = analyticsPeriodSchema.safeParse(periodInput);
  const period: AnalyticsPeriod = periodResult.success ? periodResult.data : "30d";

  const trainer = await requireTrainerProfile();

  const [summary, dailySeries] = await Promise.all([
    getTrainerAnalyticsSummary(trainer.id, period),
    getTrainerDailyAnalyticsSeries(trainer.id, period),
  ]);

  return {
    trainerId: trainer.id,
    trainerName: trainer.fullName,
    summary,
    dailySeries,
  };
}

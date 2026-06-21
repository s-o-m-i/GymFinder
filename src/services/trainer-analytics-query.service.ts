import "server-only";

import type { TrainerLeadEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AnalyticsPeriod } from "@/lib/validations/analytics";

export type TrainerAnalyticsSummary = {
  profileViews: number;
  whatsappClicks: number;
  phoneClicks: number;
  contactClicks: number;
};

export type TrainerDailyAnalyticsPoint = {
  date: string;
  profileViews: number;
  whatsappClicks: number;
  phoneClicks: number;
  contactClicks: number;
  totalClicks: number;
};

function periodToDate(period: AnalyticsPeriod): Date | null {
  const now = Date.now();
  switch (period) {
    case "7d":
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now - 90 * 24 * 60 * 60 * 1000);
    case "all":
      return null;
  }
}

function emptySummary(): TrainerAnalyticsSummary {
  return {
    profileViews: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    contactClicks: 0,
  };
}

function mapEventCounts(
  rows: { eventType: TrainerLeadEventType; _count: { id: number } }[]
): TrainerAnalyticsSummary {
  const summary = emptySummary();
  for (const row of rows) {
    switch (row.eventType) {
      case "PROFILE_VIEW":
        summary.profileViews = row._count.id;
        break;
      case "WHATSAPP_CLICK":
        summary.whatsappClicks = row._count.id;
        break;
      case "PHONE_CLICK":
        summary.phoneClicks = row._count.id;
        break;
      case "CONTACT_CLICK":
        summary.contactClicks = row._count.id;
        break;
    }
  }
  return summary;
}

export async function getTrainerAnalyticsSummary(
  trainerId: string,
  period: AnalyticsPeriod
): Promise<TrainerAnalyticsSummary> {
  const since = periodToDate(period);
  const rows = await prisma.trainerLeadEvent.groupBy({
    by: ["eventType"],
    where: {
      trainerId,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    _count: { id: true },
  });

  return mapEventCounts(rows);
}

export async function getTrainerDailyAnalyticsSeries(
  trainerId: string,
  period: AnalyticsPeriod
): Promise<TrainerDailyAnalyticsPoint[]> {
  const since = periodToDate(period) ?? new Date(0);

  const rows = await prisma.$queryRaw<
    { day: Date; eventType: TrainerLeadEventType; count: bigint }[]
  >`
    SELECT DATE("createdAt") AS day, "eventType", COUNT(*)::bigint AS count
    FROM "TrainerLeadEvent"
    WHERE "trainerId" = ${trainerId}
      AND "createdAt" >= ${since}
    GROUP BY DATE("createdAt"), "eventType"
    ORDER BY day ASC
  `;

  const byDay = new Map<string, TrainerDailyAnalyticsPoint>();

  for (const row of rows) {
    const date = row.day.toISOString().slice(0, 10);
    const point =
      byDay.get(date) ??
      {
        date,
        profileViews: 0,
        whatsappClicks: 0,
        phoneClicks: 0,
        contactClicks: 0,
        totalClicks: 0,
      };

    const count = Number(row.count);
    switch (row.eventType) {
      case "PROFILE_VIEW":
        point.profileViews += count;
        break;
      case "WHATSAPP_CLICK":
        point.whatsappClicks += count;
        point.totalClicks += count;
        break;
      case "PHONE_CLICK":
        point.phoneClicks += count;
        point.totalClicks += count;
        break;
      case "CONTACT_CLICK":
        point.contactClicks += count;
        point.totalClicks += count;
        break;
    }

    byDay.set(date, point);
  }

  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export type TrainerAnalyticsViewData = {
  trainerId: string;
  trainerName: string;
  summary: TrainerAnalyticsSummary;
  dailySeries: TrainerDailyAnalyticsPoint[];
};

export async function getTrainerAnalyticsData(
  trainerId: string,
  period: AnalyticsPeriod
): Promise<TrainerAnalyticsViewData | null> {
  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId },
    select: { id: true, fullName: true },
  });
  if (!trainer) return null;

  const [summary, dailySeries] = await Promise.all([
    getTrainerAnalyticsSummary(trainerId, period),
    getTrainerDailyAnalyticsSeries(trainerId, period),
  ]);

  return {
    trainerId: trainer.id,
    trainerName: trainer.fullName,
    summary,
    dailySeries,
  };
}

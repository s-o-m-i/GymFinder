import "server-only";

import type { AnalyticsEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AnalyticsPeriod } from "@/lib/validations/analytics";

export type AnalyticsSummary = {
  profileViews: number;
  whatsappClicks: number;
  phoneClicks: number;
  directionsClicks: number;
};

export type DailyAnalyticsPoint = {
  date: string;
  profileViews: number;
  whatsappClicks: number;
  phoneClicks: number;
  directionsClicks: number;
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

function emptySummary(): AnalyticsSummary {
  return {
    profileViews: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    directionsClicks: 0,
  };
}

function mapEventCounts(
  rows: { eventType: AnalyticsEventType; _count: { id: number } }[]
): AnalyticsSummary {
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
      case "DIRECTIONS_CLICK":
        summary.directionsClicks = row._count.id;
        break;
    }
  }
  return summary;
}

export async function getOwnerGymId(ownerId: string): Promise<string | null> {
  const gym = await prisma.gym.findUnique({
    where: { ownerId },
    select: { id: true },
  });
  return gym?.id ?? null;
}

export async function getAnalyticsSummary(
  gymId: string,
  period: AnalyticsPeriod
): Promise<AnalyticsSummary> {
  const since = periodToDate(period);
  const rows = await prisma.gymAnalyticsEvent.groupBy({
    by: ["eventType"],
    where: {
      gymId,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    _count: { id: true },
  });

  return mapEventCounts(rows);
}

export async function getDailyAnalyticsSeries(
  gymId: string,
  period: AnalyticsPeriod
): Promise<DailyAnalyticsPoint[]> {
  const since = periodToDate(period) ?? new Date(0);

  const rows = await prisma.$queryRaw<
    { day: Date; eventType: AnalyticsEventType; count: bigint }[]
  >`
    SELECT DATE("createdAt") AS day, "eventType", COUNT(*)::bigint AS count
    FROM "GymAnalyticsEvent"
    WHERE "gymId" = ${gymId}
      AND "createdAt" >= ${since}
    GROUP BY DATE("createdAt"), "eventType"
    ORDER BY day ASC
  `;

  const byDay = new Map<string, DailyAnalyticsPoint>();

  for (const row of rows) {
    const date = row.day.toISOString().slice(0, 10);
    const point =
      byDay.get(date) ??
      {
        date,
        profileViews: 0,
        whatsappClicks: 0,
        phoneClicks: 0,
        directionsClicks: 0,
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
      case "DIRECTIONS_CLICK":
        point.directionsClicks += count;
        point.totalClicks += count;
        break;
    }

    byDay.set(date, point);
  }

  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function getTopPerformingGymInsights(ownerId: string) {
  const gyms = await prisma.gym.findMany({
    where: { ownerId },
    select: { id: true, name: true },
  });

  if (gyms.length <= 1) {
    return { mostViewed: null, mostContacted: null };
  }

  const gymIds = gyms.map((g) => g.id);

  const viewRows = await prisma.gymAnalyticsEvent.groupBy({
    by: ["gymId"],
    where: { gymId: { in: gymIds }, eventType: "PROFILE_VIEW" },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  const contactRows = await prisma.gymAnalyticsEvent.groupBy({
    by: ["gymId"],
    where: {
      gymId: { in: gymIds },
      eventType: {
        in: ["WHATSAPP_CLICK", "PHONE_CLICK", "DIRECTIONS_CLICK"],
      },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  const gymName = (id: string) => gyms.find((g) => g.id === id)?.name ?? "Unknown";

  return {
    mostViewed: viewRows[0]
      ? { name: gymName(viewRows[0].gymId), count: viewRows[0]._count.id }
      : null,
    mostContacted: contactRows[0]
      ? { name: gymName(contactRows[0].gymId), count: contactRows[0]._count.id }
      : null,
  };
}

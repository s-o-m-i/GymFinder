import "server-only";

import { prisma } from "@/lib/prisma";
import type { AnalyticsPeriod } from "@/lib/validations/analytics";

export type EventAnalyticsSummary = {
  profileViews: number;
};

export type EventDailyAnalyticsPoint = {
  date: string;
  profileViews: number;
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

export async function getEventViewCount(
  eventId: string,
  period: AnalyticsPeriod = "all"
): Promise<number> {
  const since = periodToDate(period);
  return prisma.eventAnalyticsEvent.count({
    where: {
      eventId,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
  });
}

export async function getEventViewCountsByEventIds(
  eventIds: string[],
  period: AnalyticsPeriod = "all"
): Promise<Map<string, number>> {
  if (eventIds.length === 0) return new Map();

  const since = periodToDate(period);
  const rows = await prisma.eventAnalyticsEvent.groupBy({
    by: ["eventId"],
    where: {
      eventId: { in: eventIds },
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    _count: { id: true },
  });

  return new Map(rows.map((row) => [row.eventId, row._count.id]));
}

export async function getEventAnalyticsSummary(
  eventId: string,
  period: AnalyticsPeriod
): Promise<EventAnalyticsSummary> {
  const profileViews = await getEventViewCount(eventId, period);
  return { profileViews };
}

export async function getEventDailyAnalyticsSeries(
  eventId: string,
  period: AnalyticsPeriod
): Promise<EventDailyAnalyticsPoint[]> {
  const since = periodToDate(period) ?? new Date(0);

  const rows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT DATE("createdAt") AS day, COUNT(*)::bigint AS count
    FROM "EventAnalyticsEvent"
    WHERE "eventId" = ${eventId}
      AND "createdAt" >= ${since}
    GROUP BY DATE("createdAt")
    ORDER BY day ASC
  `;

  return rows.map((row) => ({
    date: row.day.toISOString().slice(0, 10),
    profileViews: Number(row.count),
  }));
}

export async function getOwnerEventsTotalViews(
  ownerId: string,
  period: AnalyticsPeriod = "all"
): Promise<number> {
  const since = periodToDate(period);
  const events = await prisma.event.findMany({
    where: { createdByOwnerId: ownerId },
    select: { id: true },
  });
  if (events.length === 0) return 0;

  return prisma.eventAnalyticsEvent.count({
    where: {
      eventId: { in: events.map((e) => e.id) },
      ...(since ? { createdAt: { gte: since } } : {}),
    },
  });
}

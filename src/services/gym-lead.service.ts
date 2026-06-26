import "server-only";

import type { GymLeadGoal } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AnalyticsPeriod } from "@/lib/validations/analytics";

export type GymLeadRecord = {
  id: string;
  name: string;
  goal: GymLeadGoal;
  customGoal: string | null;
  createdAt: Date;
};

export type GymLeadStats = {
  total: number;
  byGoal: { goal: GymLeadGoal; count: number }[];
  recent: GymLeadRecord[];
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

export async function createGymLead(input: {
  gymId: string;
  name: string;
  goal: GymLeadGoal;
  customGoal?: string | null;
  sessionId?: string | null;
  userAgent?: string | null;
}) {
  return prisma.gymLead.create({
    data: {
      gymId: input.gymId,
      name: input.name.trim(),
      goal: input.goal,
      customGoal:
        input.goal === "OTHER" && input.customGoal?.trim()
          ? input.customGoal.trim()
          : null,
      sessionId: input.sessionId ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}

export async function getGymLeadStats(
  gymId: string,
  period: AnalyticsPeriod = "30d"
): Promise<GymLeadStats> {
  const since = periodToDate(period);
  const where = {
    gymId,
    ...(since ? { createdAt: { gte: since } } : {}),
  };

  const [total, grouped, recent] = await Promise.all([
    prisma.gymLead.count({ where }),
    prisma.gymLead.groupBy({
      by: ["goal"],
      where,
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.gymLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, goal: true, customGoal: true, createdAt: true },
    }),
  ]);

  return {
    total,
    byGoal: grouped.map((row) => ({ goal: row.goal, count: row._count.id })),
    recent,
  };
}

import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface LogAiGymSearchInput {
  query: string;
  filtersJson: Prisma.InputJsonValue;
  resultsCount: number;
  city?: string | null;
  sessionId?: string | null;
  visitorHash?: string | null;
  userAgent?: string | null;
}

/**
 * Persists AI gym search analytics. Fire-and-forget — never throws to caller.
 */
export async function logAiGymSearch(input: LogAiGymSearchInput): Promise<void> {
  try {
    await prisma.aiGymSearch.create({
      data: {
        query: input.query.slice(0, 500),
        filtersJson: input.filtersJson,
        resultsCount: input.resultsCount,
        city: input.city ?? null,
        sessionId: input.sessionId ?? null,
        visitorHash: input.visitorHash ?? null,
        userAgent: input.userAgent?.slice(0, 512) ?? null,
        hadResults: input.resultsCount > 0,
      },
    });
  } catch (err) {
    console.error("logAiGymSearch failed:", err);
  }
}

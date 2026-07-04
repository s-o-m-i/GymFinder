import "server-only";

import { prisma } from "@/lib/prisma";
import { CITIES } from "@/lib/constants";

export interface PlatformStats {
  cities: number;
  gyms: number;
  trainers: number;
  fightingClubs: number;
  events: number;
  successStories: number;
}

const FALLBACK_STATS: PlatformStats = {
  cities: CITIES.length,
  gyms: 50,
  trainers: 25,
  fightingClubs: 20,
  events: 12,
  successStories: 8,
};

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const approved = { listingStatus: "approved" as const };
    const publishedStory = { status: "PUBLISHED" as const };

    const [
      gyms,
      trainers,
      fightingClubs,
      events,
      successStories,
      gymCities,
      trainerCities,
    ] = await Promise.all([
      prisma.gym.count({ where: approved }),
      prisma.trainer.count({ where: { isPublished: true } }),
      prisma.gym.count({
        where: {
          ...approved,
          type: { in: ["boxing", "mma", "muay_thai", "kickboxing", "martial_arts"] },
        },
      }),
      prisma.event.count(),
      prisma.successStory.count({ where: publishedStory }),
      prisma.gym.groupBy({ by: ["city"], where: approved }),
      prisma.trainer.groupBy({ by: ["city"], where: { isPublished: true } }),
    ]);

    const citySet = new Set([
      ...gymCities.map((r) => r.city),
      ...trainerCities.map((r) => r.city),
    ]);

    return {
      cities: Math.max(citySet.size, CITIES.length),
      gyms,
      trainers,
      fightingClubs,
      events,
      successStories,
    };
  } catch {
    return FALLBACK_STATS;
  }
}

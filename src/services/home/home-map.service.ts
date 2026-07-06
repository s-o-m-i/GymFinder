import "server-only";

import { prisma } from "@/lib/prisma";
import {
  getPakistanMapCityHref,
  PAKISTAN_MAP_CITIES,
  type PakistanMapCityStat,
} from "@/lib/home-map-data";

function normalizeCity(value: string): string {
  return value.trim().toLowerCase();
}

export async function getPakistanMapCityStats(): Promise<PakistanMapCityStat[]> {
  try {
    const groups = await prisma.gym.groupBy({
      by: ["city"],
      where: { listingStatus: "approved" },
      _count: { _all: true },
    });

    const countByCity = new Map<string, number>();
    for (const group of groups) {
      countByCity.set(normalizeCity(group.city), group._count._all);
    }

    return PAKISTAN_MAP_CITIES.map((city) => ({
      ...city,
      gymCount: countByCity.get(normalizeCity(city.name)) ?? 0,
      href: getPakistanMapCityHref(city.name),
    }));
  } catch {
    return PAKISTAN_MAP_CITIES.map((city) => ({
      ...city,
      gymCount: 0,
      href: getPakistanMapCityHref(city.name),
    }));
  }
}

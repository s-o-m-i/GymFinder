import "server-only";

import { prisma } from "@/lib/prisma";
import { PAKISTAN_CITIES } from "@/lib/pakistan-cities";
import { buildGymOrderBy, buildGymQuery } from "@/lib/ai/buildGymQuery";
import {
  extractGymFilters,
  type FilterExtractionSource,
} from "@/lib/ai/gym-search";
import { logAiGymSearch } from "@/lib/ai/log-ai-gym-search";
import { checkExpiredFeaturedGyms } from "@/services/featured/featured-gym.service";
import type { GymCardData } from "@/types";
import type { GymSearchFilters } from "@/types/gym-search";

const AI_SEARCH_LIMIT = 24;

const gymInclude = {
  galleryImages: { select: { imageUrl: true, alt: true }, take: 3 },
  disciplines: { include: { discipline: { select: { name: true } } } },
  amenities: { include: { amenity: { select: { name: true } } } },
  membershipPlans: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
    take: 5,
  },
  staffMembers: {
    where: { isActive: true },
    orderBy: [{ displayOrder: "asc" as const }, { createdAt: "asc" as const }],
    take: 6,
  },
  reviews: { orderBy: { createdAt: "desc" as const }, take: 5 },
};

type GymWithAiIncludes = Awaited<
  ReturnType<
    typeof prisma.gym.findMany<{
      include: typeof gymInclude;
    }>
  >
>[number];

export interface AiGymSearchContext {
  sessionId?: string | null;
  visitorHash?: string | null;
  userAgent?: string | null;
}

export interface AiGymSearchResponse {
  filters: GymSearchFilters;
  gyms: GymCardData[];
  resultsCount: number;
  source: FilterExtractionSource;
  warning?: string;
}

type GymRow = GymWithAiIncludes;

function toGymCardData(gym: GymRow): GymCardData {
  return {
    id: gym.id,
    name: gym.name,
    slug: gym.slug,
    type: gym.type,
    customTypeLabel: gym.customTypeLabel,
    area: gym.area,
    city: gym.city,
    priceMin: gym.priceMin,
    priceMax: gym.priceMax,
    ladiesStatus: gym.ladiesStatus,
    sizeCategory: gym.sizeCategory,
    whatsappNumber: gym.whatsappNumber,
    rating: gym.rating,
    featured: gym.featured,
    featuredUntil: gym.featuredUntil,
    openingHours: gym.openingHours,
    coverImage: gym.coverImage,
    galleryImages: gym.galleryImages,
    disciplines: gym.disciplines,
  };
}

export function inferCityFromFilters(
  filters: GymSearchFilters,
  query: string
): string | null {
  if (filters.city) return filters.city;

  const lowerQuery = query.toLowerCase();
  for (const city of PAKISTAN_CITIES) {
    if (lowerQuery.includes(city.toLowerCase())) return city;
  }
  return null;
}

/**
 * Full AI gym search pipeline:
 * 1. Extract filters via Gemini
 * 2. Query Prisma (source of truth)
 * 3. Log analytics (non-blocking)
 */
export async function runAiGymSearch(
  query: string,
  context: AiGymSearchContext = {}
): Promise<AiGymSearchResponse> {
  const extraction = await extractGymFilters(query);
  const { filters } = extraction;
  await checkExpiredFeaturedGyms();
  const where = buildGymQuery(filters);
  const orderBy = buildGymOrderBy(filters);

  const gyms = await prisma.gym.findMany({
    where,
    include: gymInclude,
    orderBy,
    take: AI_SEARCH_LIMIT,
  });

  const resultsCount = gyms.length;
  const city = inferCityFromFilters(filters, query);

  void logAiGymSearch({
    query,
    filtersJson: JSON.parse(JSON.stringify(filters)),
    resultsCount,
    city,
    sessionId: context.sessionId,
    visitorHash: context.visitorHash,
    userAgent: context.userAgent,
  });

  return {
    filters,
    gyms: gyms.map(toGymCardData),
    resultsCount,
    source: extraction.source,
    warning: extraction.warning,
  };
}

export async function getAiGymSearchStats() {
  const [total, withResults, last7Days] = await Promise.all([
    prisma.aiGymSearch.count(),
    prisma.aiGymSearch.count({ where: { hadResults: true } }),
    prisma.aiGymSearch.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return { total, withResults, last7Days };
}

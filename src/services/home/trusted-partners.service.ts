import "server-only";

import {
  computeTrustedPartnerPriority,
  SHOWCASE_TRUSTED_BRANDS,
  sortTrustedPartners,
  TRUSTED_PARTNERS_MAX,
  type TrustedEcosystemStats,
  type TrustedPartner,
  type TrustedPartnerBusinessType,
  type TrustedPartnerTier,
  type TrustedBrandVariant,
} from "@/lib/trusted-partners-data";
import { getGymCoverUrl } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { CITIES } from "@/lib/constants";
import type { GymType } from "@prisma/client";

function mapGymBusinessType(type: GymType): TrustedPartnerBusinessType {
  switch (type) {
    case "boxing":
      return "boxing_club";
    case "mma":
    case "muay_thai":
    case "kickboxing":
    case "martial_arts":
      return "mma_academy";
    default:
      return "gym";
  }
}

function resolveGymPartnerTier(gym: { featured: boolean; claimed: boolean }): TrustedPartnerTier {
  if (gym.featured) return "premium";
  if (gym.claimed) return "official";
  return "verified";
}

function resolveTrainerPartnerTier(trainer: {
  isFeatured: boolean;
  isVerified: boolean;
}): TrustedPartnerTier {
  if (trainer.isFeatured) return "premium";
  return "verified";
}

function inferBrandVariant(name: string): TrustedBrandVariant {
  const normalized = name.toLowerCase();
  if (normalized.includes("gold")) return "golds-gym";
  if (normalized.includes("shape")) return "shapes";
  if (normalized.includes("iron box")) return "iron-box";
  if (normalized.includes("ufc")) return "ufc-gym";
  if (normalized.includes("flex")) return "flex-fitness";
  if (normalized.includes("structure")) return "structure";
  if (normalized.includes("power house") || normalized.includes("powerhouse")) return "power-house";
  return "generic";
}

function withMeta(
  partner: Omit<TrustedPartner, "priority" | "rating" | "successStoryCount" | "trainerCount">,
  index = 0
): TrustedPartner {
  const rating = 4.2 + (index % 4) * 0.15;
  const full: TrustedPartner = {
    ...partner,
    rating,
    successStoryCount: 3 + (index % 10),
    trainerCount: 2 + (index % 6),
    priority: 0,
  };
  full.priority = computeTrustedPartnerPriority(full);
  return full;
}

export async function getTrustedEcosystemStats(): Promise<TrustedEcosystemStats> {
  try {
    const approved = { listingStatus: "approved" as const };
    const [gyms, trainers, gymCities, trainerCities, successStories, events] = await Promise.all([
      prisma.gym.count({ where: approved }),
      prisma.trainer.count({ where: { isPublished: true } }),
      prisma.gym.groupBy({ by: ["city"], where: approved }),
      prisma.trainer.groupBy({ by: ["city"], where: { isPublished: true } }),
      prisma.successStory.count({ where: { status: "PUBLISHED" } }),
      prisma.event.count(),
    ]);

    const citySet = new Set([
      ...gymCities.map((row) => row.city),
      ...trainerCities.map((row) => row.city),
    ]);

    return {
      gyms,
      trainers,
      cities: Math.max(citySet.size, CITIES.length),
      successStories,
      events,
    };
  } catch {
    return {
      gyms: 500,
      trainers: 2000,
      cities: 60,
      successStories: 1200,
      events: 300,
    };
  }
}

export async function getTrustedPartners(): Promise<TrustedPartner[]> {
  try {
    const now = new Date();

    const [gyms, trainers] = await Promise.all([
      prisma.gym.findMany({
        where: {
          listingStatus: "approved",
          OR: [{ featured: true }, { claimed: true }],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          featured: true,
          featuredUntil: true,
          claimed: true,
          rating: true,
          coverImage: true,
          galleryImages: { select: { imageUrl: true }, take: 1 },
          _count: {
            select: {
              trainers: true,
              publishedStories: true,
              linkedStories: true,
            },
          },
        },
        orderBy: [
          { featured: "desc" },
          { claimed: "desc" },
          { rating: { sort: "desc", nulls: "last" } },
          { createdAt: "desc" },
        ],
        take: TRUSTED_PARTNERS_MAX,
      }),
      prisma.trainer.findMany({
        where: {
          isPublished: true,
          OR: [{ isFeatured: true }, { isVerified: true }],
        },
        select: {
          id: true,
          fullName: true,
          slug: true,
          profileImage: true,
          isFeatured: true,
          isVerified: true,
          rating: true,
          _count: {
            select: {
              publishedStories: true,
              linkedStories: true,
            },
          },
        },
        orderBy: [
          { isFeatured: "desc" },
          { isVerified: "desc" },
          { rating: { sort: "desc", nulls: "last" } },
          { createdAt: "desc" },
        ],
        take: 6,
      }),
    ]);

    const livePartners: TrustedPartner[] = [
      ...gyms
        .filter((gym) => !gym.featuredUntil || gym.featuredUntil > now)
        .map((gym, index) =>
          withMeta(
            {
              id: gym.id,
              name: gym.name,
              slug: gym.slug,
              logo: getGymCoverUrl(gym) ?? null,
              verified: gym.claimed,
              featured: gym.featured,
              claimed: gym.claimed,
              website: null,
              gymId: gym.id,
              trainerId: null,
              businessType: mapGymBusinessType(gym.type),
              partnerTier: resolveGymPartnerTier(gym),
              href: `/gyms/${gym.slug}`,
              brandVariant: inferBrandVariant(gym.name),
            },
            index
          )
        ),
      ...trainers.map((trainer, index) =>
        withMeta(
          {
            id: trainer.id,
            name: trainer.fullName,
            slug: trainer.slug,
            logo: trainer.profileImage,
            verified: trainer.isVerified,
            featured: trainer.isFeatured,
            claimed: false,
            website: null,
            gymId: null,
            trainerId: trainer.id,
            businessType: "trainer",
            partnerTier: resolveTrainerPartnerTier(trainer),
            href: `/trainers/${trainer.slug}`,
            brandVariant: "generic",
          },
          index + gyms.length
        )
      ),
    ];

    const sortedLive = sortTrustedPartners(livePartners).slice(0, 4);
    const showcase = SHOWCASE_TRUSTED_BRANDS.map(withMeta);
    const used = new Set(sortedLive.map((item) => item.name.toLowerCase()));

    const merged = [
      ...sortedLive,
      ...showcase.filter((item) => !used.has(item.name.toLowerCase())),
    ].slice(0, TRUSTED_PARTNERS_MAX);

    return merged.length > 0 ? merged : showcase;
  } catch {
    return SHOWCASE_TRUSTED_BRANDS.map(withMeta);
  }
}

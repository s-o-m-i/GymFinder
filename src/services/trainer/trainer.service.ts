import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { slugify } from "@/lib/utils";
import { TRAINER_EXPERIENCE_LEVELS, TRAINER_RATE_BUCKETS, TRAINER_RATING_FILTERS } from "@/lib/trainer-constants";
import type { TrainerListingFilters } from "@/lib/validations/trainer";

export type TrainerCardData = {
  id: string;
  fullName: string;
  slug: string;
  headline: string | null;
  city: string;
  area: string | null;
  specialization: string | null;
  experienceYears: number | null;
  hourlyRate: number | null;
  profileImage: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  rating: number | null;
  totalReviews: number;
  whatsappNumber: string | null;
  gym: { id: string; name: string; slug: string } | null;
};

export function parseTrainerSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
  fixedCity?: string
): TrainerListingFilters & { page: number; limit: number } {
  const getString = (key: string) => {
    const val = searchParams[key];
    return typeof val === "string" ? val : undefined;
  };

  return {
    search: getString("search"),
    city: fixedCity ?? getString("city"),
    specialization: getString("specialization"),
    experience: getString("experience") as TrainerListingFilters["experience"],
    rate: getString("rate") as TrainerListingFilters["rate"],
    gender: getString("gender") as TrainerListingFilters["gender"],
    rating: getString("rating") as TrainerListingFilters["rating"],
    featured: getString("featured") as TrainerListingFilters["featured"],
    verified: getString("verified") as TrainerListingFilters["verified"],
    sort: (getString("sort") as TrainerListingFilters["sort"]) ?? "featured",
    page: getString("page") ? Number(getString("page")) : 1,
    limit: 12,
  };
}

export function buildTrainerWhere(
  filters: TrainerListingFilters,
  publicOnly = true
): Prisma.TrainerWhereInput {
  const where: Prisma.TrainerWhereInput = {};

  if (publicOnly) {
    where.isPublished = true;
  }

  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { headline: { contains: filters.search, mode: "insensitive" } },
      { bio: { contains: filters.search, mode: "insensitive" } },
      { area: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.city) {
    where.city = { equals: filters.city, mode: "insensitive" };
  }

  if (filters.specialization) {
    where.specialization = filters.specialization;
  }

  if (filters.featured === "true") {
    where.isFeatured = true;
  }

  if (filters.verified === "true") {
    where.isVerified = true;
  }

  if (filters.experience) {
    const level = TRAINER_EXPERIENCE_LEVELS.find((l) => l.value === filters.experience);
    if (level) {
      where.experienceYears = { gte: level.min, lte: level.max };
    }
  }

  if (filters.rate) {
    const bucket = TRAINER_RATE_BUCKETS.find((b) => b.value === filters.rate);
    if (bucket) {
      where.hourlyRate = { gte: bucket.min, lte: bucket.max };
    }
  }

  if (filters.gender) {
    where.gender = filters.gender;
  }

  if (filters.rating) {
    const level = TRAINER_RATING_FILTERS.find((r) => r.value === filters.rating);
    if (level) {
      where.rating = { gte: level.min };
    }
  }

  return where;
}

export function buildTrainerOrderBy(
  sort?: TrainerListingFilters["sort"]
): Prisma.TrainerOrderByWithRelationInput[] {
  switch (sort) {
    case "rating":
      return [{ rating: { sort: "desc", nulls: "last" } }, { isFeatured: "desc" }];
    case "experience":
      return [{ experienceYears: { sort: "desc", nulls: "last" } }, { isFeatured: "desc" }];
    case "rate_asc":
      return [{ hourlyRate: { sort: "asc", nulls: "last" } }, { isFeatured: "desc" }];
    case "rate_desc":
      return [{ hourlyRate: { sort: "desc", nulls: "last" } }, { isFeatured: "desc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    default:
      return [{ isFeatured: "desc" }, { isVerified: "desc" }, { rating: { sort: "desc", nulls: "last" } }];
  }
}

const trainerCardSelect = {
  id: true,
  fullName: true,
  slug: true,
  headline: true,
  city: true,
  area: true,
  specialization: true,
  experienceYears: true,
  hourlyRate: true,
  profileImage: true,
  isVerified: true,
  isFeatured: true,
  rating: true,
  totalReviews: true,
  whatsappNumber: true,
  gym: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.TrainerSelect;

export async function getTrainersListing(
  searchParams: Record<string, string | string[] | undefined>,
  fixedCity?: string
) {
  const filters = parseTrainerSearchParams(searchParams, fixedCity);
  const where = buildTrainerWhere(filters);
  const orderBy = buildTrainerOrderBy(filters.sort);
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 12;
  const skip = (page - 1) * limit;

  const [trainers, total] = await Promise.all([
    prisma.trainer.findMany({
      where,
      select: trainerCardSelect,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.trainer.count({ where }),
  ]);

  return {
    trainers: trainers as TrainerCardData[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
    filters,
  };
}

export async function getTrainerBySlug(slug: string) {
  return prisma.trainer.findUnique({
    where: { slug },
    include: {
      gym: {
        select: {
          id: true,
          name: true,
          slug: true,
          area: true,
          city: true,
          coverImage: true,
          listingStatus: true,
        },
      },
    },
  });
}

export async function getPublishedTrainerSlugs() {
  return prisma.trainer.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });
}

export async function generateUniqueTrainerSlug(fullName: string, city: string): Promise<string> {
  const base = slugify(`${fullName}-${city}`);
  let slug = base;
  let attempt = 0;

  while (attempt < 5) {
    const existing = await prisma.trainer.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) return slug;
    attempt += 1;
    slug = `${base}-${Date.now().toString(36).slice(-4)}${attempt}`;
  }

  return `${base}-${Date.now()}`;
}

export async function getTrainerCitiesWithCounts() {
  const rows = await prisma.trainer.groupBy({
    by: ["city"],
    where: { isPublished: true },
    _count: { _all: true },
    orderBy: { city: "asc" },
  });
  return rows.map((r) => ({ city: r.city, count: r._count._all }));
}

export async function getFeaturedTrainers(limit = 6) {
  return prisma.trainer.findMany({
    where: { isPublished: true, isFeatured: true },
    select: trainerCardSelect,
    orderBy: [{ rating: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    take: limit,
  });
}

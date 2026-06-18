import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { GymFilters } from "@/types";

export function parseGymSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
  fixedCity?: string,
  fixedType?: string
): GymFilters {
  const getString = (key: string) => {
    const val = searchParams[key];
    return typeof val === "string" ? val : undefined;
  };

  return {
    search:       getString("search"),
    city:         fixedCity ?? getString("city"),
    area:         getString("area"),
    type:         fixedType ?? getString("type"),
    priceMin:     getString("priceMin") ? Number(getString("priceMin")) : undefined,
    priceMax:     getString("priceMax") ? Number(getString("priceMax")) : undefined,
    ladiesStatus: getString("ladiesStatus"),
    discipline:   getString("discipline"),
    sort:         (getString("sort") as GymFilters["sort"]) ?? "featured",
    page:         getString("page") ? Number(getString("page")) : 1,
    limit:        12,
  };
}

export function buildGymWhere(filters: GymFilters, publicOnly = true): Prisma.GymWhereInput {
  const where: Prisma.GymWhereInput = {};

  if (publicOnly) {
    where.listingStatus = "approved";
  }

  if (filters.search) {
    where.OR = [
      { name:        { contains: filters.search, mode: "insensitive" } },
      { area:        { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.city)        where.city        = { equals: filters.city,        mode: "insensitive" };
  if (filters.area)        where.area        = { equals: filters.area,        mode: "insensitive" };
  if (filters.type)        where.type        = filters.type as Prisma.EnumGymTypeFilter["equals"];
  if (filters.priceMin !== undefined) where.priceMin = { gte: filters.priceMin };
  if (filters.priceMax !== undefined) where.priceMax = { lte: filters.priceMax };
  if (filters.ladiesStatus) where.ladiesStatus = filters.ladiesStatus as Prisma.EnumLadiesStatusFilter["equals"];
  if (filters.discipline) {
    where.disciplines = {
      some: { discipline: { name: { equals: filters.discipline, mode: "insensitive" } } },
    };
  }

  return where;
}

export function buildGymOrderBy(sort?: string): Prisma.GymOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":  return [{ priceMin: "asc"  }, { featured: "desc" }];
    case "price_desc": return [{ priceMax: "desc" }, { featured: "desc" }];
    case "rating":     return [{ rating: { sort: "desc", nulls: "last" } }];
    default:           return [{ featured: "desc" }, { createdAt: "desc" }];
  }
}

export async function getGymsListing(
  searchParams: Record<string, string | string[] | undefined>,
  fixedCity?: string,
  fixedType?: string
) {
  const filters = parseGymSearchParams(searchParams, fixedCity, fixedType);
  const where   = buildGymWhere(filters);
  const orderBy = buildGymOrderBy(filters.sort);
  const page    = filters.page ?? 1;
  const limit   = filters.limit ?? 12;
  const skip    = (page - 1) * limit;

  const [gyms, total] = await Promise.all([
    prisma.gym.findMany({
      where,
      include: {
        galleryImages: { select: { imageUrl: true, alt: true }, take: 1 },
        disciplines: { include: { discipline: { select: { name: true } } } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.gym.count({ where }),
  ]);

  return { gyms, total, page, totalPages: Math.ceil(total / limit), filters };
}

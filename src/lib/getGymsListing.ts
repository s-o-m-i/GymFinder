import { buildGymRatingWhere } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { GymFilters } from "@/types";
import { checkExpiredFeaturedGyms } from "@/services/featured/featured-gym.service";
import {
  BRANCH_LISTING_INCLUDE,
  toGymCardDataFromBranch,
} from "@/lib/gym-branch-listing";

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
    amenity:      getString("amenity"),
    rating:       getString("rating"),
    sort:         (getString("sort") as GymFilters["sort"]) ?? "featured",
    page:         getString("page") ? Number(getString("page")) : 1,
    limit:        12,
  };
}

function tagNameFilter(name: string) {
  return { name: { equals: name, mode: "insensitive" as const } };
}

export function buildBranchListingWhere(
  filters: GymFilters,
  publicOnly = true,
  fixedTypes?: readonly string[]
): Prisma.GymBranchWhereInput {
  const where: Prisma.GymBranchWhereInput = {};
  const and: Prisma.GymBranchWhereInput[] = [];

  const gymWhere: Prisma.GymWhereInput = {};
  if (publicOnly) {
    gymWhere.listingStatus = "approved";
  }
  if (fixedTypes?.length) {
    gymWhere.type = { in: [...fixedTypes] as Prisma.EnumGymTypeFilter["in"] };
  } else if (filters.type) {
    gymWhere.type = filters.type as Prisma.EnumGymTypeFilter["equals"];
  }
  if (filters.rating) {
    const ratingWhere = buildGymRatingWhere(filters.rating);
    if (ratingWhere) Object.assign(gymWhere, ratingWhere);
  }

  where.status = "ACTIVE";
  if (Object.keys(gymWhere).length > 0) {
    where.gym = gymWhere;
  }

  if (filters.search) {
    const contains = { contains: filters.search, mode: "insensitive" as const };
    and.push({
      OR: [
        { name: contains },
        { area: contains },
        { city: contains },
        { description: contains },
        { gym: { name: contains } },
        { gym: { description: contains } },
      ],
    });
  }

  if (filters.city) {
    and.push({ city: { equals: filters.city, mode: "insensitive" } });
  }
  if (filters.area) {
    and.push({ area: { equals: filters.area, mode: "insensitive" } });
  }

  if (filters.priceMin !== undefined) {
    and.push({
      OR: [
        { priceMin: { gte: filters.priceMin } },
        { AND: [{ priceMin: null }, { gym: { priceMin: { gte: filters.priceMin } } }] },
      ],
    });
  }
  if (filters.priceMax !== undefined) {
    and.push({
      OR: [
        { priceMax: { lte: filters.priceMax } },
        { AND: [{ priceMax: null }, { gym: { priceMax: { lte: filters.priceMax } } }] },
      ],
    });
  }

  if (filters.ladiesStatus) {
    const ladiesStatus = filters.ladiesStatus as Prisma.EnumLadiesStatusFilter["equals"];
    and.push({
      OR: [
        { ladiesStatus },
        { AND: [{ ladiesStatus: null }, { gym: { ladiesStatus } }] },
      ],
    });
  }

  if (filters.discipline) {
    const discipline = { discipline: tagNameFilter(filters.discipline) };
    and.push({
      OR: [
        { useCommonDisciplines: true, gym: { disciplines: { some: discipline } } },
        { useCommonDisciplines: false, disciplines: { some: discipline } },
        {
          useCommonDisciplines: false,
          disciplines: { none: {} },
          gym: { disciplines: { some: discipline } },
        },
      ],
    });
  }

  if (filters.amenity) {
    const amenity = { amenity: tagNameFilter(filters.amenity) };
    and.push({
      OR: [
        { useCommonAmenities: true, gym: { amenities: { some: amenity } } },
        { useCommonAmenities: false, amenities: { some: amenity } },
        {
          useCommonAmenities: false,
          amenities: { none: {} },
          gym: { amenities: { some: amenity } },
        },
      ],
    });
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
}

export function buildBranchListingOrderBy(
  sort?: string
): Prisma.GymBranchOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ gym: { priceMin: "asc" } }, { gym: { featured: "desc" } }];
    case "price_desc":
      return [{ gym: { priceMax: "desc" } }, { gym: { featured: "desc" } }];
    case "rating":
      return [
        { gym: { rating: { sort: "desc", nulls: "last" } } },
        { gym: { featured: "desc" } },
      ];
    default:
      return [
        { gym: { featured: "desc" } },
        { isPrimary: "desc" },
        { createdAt: "desc" },
      ];
  }
}

export async function getGymsListing(
  searchParams: Record<string, string | string[] | undefined>,
  fixedCity?: string,
  fixedType?: string,
  fixedTypes?: readonly string[]
) {
  await checkExpiredFeaturedGyms();

  const filters = parseGymSearchParams(searchParams, fixedCity, fixedType);
  const where = buildBranchListingWhere(filters, true, fixedTypes);
  const orderBy = buildBranchListingOrderBy(filters.sort);
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 12;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.gymBranch.findMany({
      where,
      include: BRANCH_LISTING_INCLUDE,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.gymBranch.count({ where }),
  ]);

  const gyms = rows.map((row) => toGymCardDataFromBranch(row));

  return { gyms, total, page, totalPages: Math.ceil(total / limit), filters };
}

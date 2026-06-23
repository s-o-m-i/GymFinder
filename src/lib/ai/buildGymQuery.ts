import "server-only";

import type { Prisma } from "@prisma/client";
import type { GymSearchFilters } from "@/types/gym-search";

/**
 * Converts AI-extracted filters into a Prisma where clause.
 * Database remains the source of truth — only approved listings are returned.
 */
export function buildGymQuery(filters: GymSearchFilters): Prisma.GymWhereInput {
  const where: Prisma.GymWhereInput = {
    listingStatus: "approved",
  };

  const andConditions: Prisma.GymWhereInput[] = [];

  if (filters.city) {
    where.city = { equals: filters.city, mode: "insensitive" };
  }

  if (filters.area) {
    where.area = { contains: filters.area, mode: "insensitive" };
  }

  if (filters.gymType) {
    where.type = filters.gymType;
  }

  if (filters.ladiesStatus) {
    where.ladiesStatus = filters.ladiesStatus;
  }

  if (filters.priceMin !== undefined) {
    where.priceMin = { gte: filters.priceMin };
  }

  if (filters.priceMax !== undefined) {
    // User budget cap — gyms whose starting price fits the budget
    andConditions.push({
      OR: [
        { priceMin: { lte: filters.priceMax } },
        { priceMax: { lte: filters.priceMax } },
      ],
    });
  }

  if (filters.sizeCategory) {
    where.sizeCategory = filters.sizeCategory;
  }

  if (filters.featured === true) {
    where.featured = true;
  }

  if (filters.ratingMin !== undefined) {
    where.rating = { gte: filters.ratingMin };
  }

  if (filters.disciplineNames?.length) {
    for (const name of filters.disciplineNames) {
      andConditions.push({
        disciplines: {
          some: {
            discipline: {
              name: { contains: name, mode: "insensitive" },
            },
          },
        },
      });
    }
  }

  if (filters.amenityNames?.length) {
    for (const name of filters.amenityNames) {
      andConditions.push({
        amenities: {
          some: {
            amenity: {
              name: { contains: name, mode: "insensitive" },
            },
          },
        },
      });
    }
  }

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: filters.searchTerm, mode: "insensitive" } },
        { area: { contains: filters.searchTerm, mode: "insensitive" } },
        { description: { contains: filters.searchTerm, mode: "insensitive" } },
        { address: { contains: filters.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return where;
}

export function buildGymOrderBy(
  filters: GymSearchFilters
): Prisma.GymOrderByWithRelationInput[] {
  if (filters.featured) {
    return [{ featured: "desc" }, { rating: { sort: "desc", nulls: "last" } }];
  }
  if (filters.ratingMin !== undefined) {
    return [{ rating: { sort: "desc", nulls: "last" } }, { featured: "desc" }];
  }
  if (filters.priceMax !== undefined) {
    return [{ priceMin: "asc" }, { featured: "desc" }];
  }
  return [{ featured: "desc" }, { rating: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }];
}

import type { Prisma } from "@prisma/client";

const ACTIVE = { status: "ACTIVE" as const };

export function gymLocationMatchWhere(filters: {
  city?: string;
  area?: string;
}): Prisma.GymWhereInput | undefined {
  if (!filters.city && !filters.area) return undefined;

  const gymMatch: Prisma.GymWhereInput = {};
  const branchMatch: Prisma.GymBranchWhereInput = { ...ACTIVE };

  if (filters.city) {
    gymMatch.city = { equals: filters.city, mode: "insensitive" };
    branchMatch.city = { equals: filters.city, mode: "insensitive" };
  }
  if (filters.area) {
    gymMatch.area = { equals: filters.area, mode: "insensitive" };
    branchMatch.area = { equals: filters.area, mode: "insensitive" };
  }

  return {
    OR: [gymMatch, { branches: { some: branchMatch } }],
  };
}

export function gymTextSearchWhere(search: string): Prisma.GymWhereInput {
  const contains = { contains: search, mode: "insensitive" as const };
  return {
    OR: [
      { name: contains },
      { area: contains },
      { description: contains },
      {
        branches: {
          some: {
            ...ACTIVE,
            OR: [{ name: contains }, { area: contains }, { city: contains }],
          },
        },
      },
    ],
  };
}

export const ACTIVE_BRANCH_COUNT_INCLUDE = {
  _count: {
    select: {
      branches: { where: ACTIVE },
    },
  },
} satisfies Prisma.GymInclude;

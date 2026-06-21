import { NextRequest, NextResponse } from "next/server";
import { buildGymRatingWhere } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { syncGymImages } from "@/lib/gym-images";
import { resolveAmenityIds, resolveDisciplineIds } from "@/lib/gym-tags";
import type { GymFilters } from "@/types";
import type { Prisma } from "@prisma/client";

const GYM_INCLUDE = {
  galleryImages: { select: { imageUrl: true, alt: true }, take: 1 },
  disciplines: {
    include: { discipline: { select: { name: true } } },
  },
} satisfies Prisma.GymInclude;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const filters: GymFilters = {
      search: searchParams.get("search") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      area: searchParams.get("area") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      priceMin: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined,
      priceMax: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined,
      ladiesStatus: searchParams.get("ladiesStatus") ?? undefined,
      discipline: searchParams.get("discipline") ?? undefined,
      amenity: searchParams.get("amenity") ?? undefined,
      rating: searchParams.get("rating") ?? undefined,
      sort: (searchParams.get("sort") as GymFilters["sort"]) ?? "featured",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 12,
    };

    const where = buildWhereClause(filters);
    const orderBy = buildOrderBy(filters.sort);
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 12, 50);
    const skip = (page - 1) * limit;

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where,
        include: GYM_INCLUDE,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.gym.count({ where }),
    ]);

    return NextResponse.json({
      gyms,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/gyms error:", error);
    return NextResponse.json({ error: "Failed to fetch gyms" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSecret = req.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const slug = body.slug ?? slugify(`${body.name}-${body.area}-${body.city}`);
    const existing = await prisma.gym.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const {
      disciplines,
      customDisciplines,
      amenities,
      customAmenities,
      coverImage,
      galleryImages,
      ...gymData
    } = body;

    const disciplineIds = await resolveDisciplineIds(
      prisma,
      disciplines ?? [],
      customDisciplines ?? []
    );
    const amenityIds = await resolveAmenityIds(
      prisma,
      amenities ?? [],
      customAmenities ?? []
    );

    const gym = await prisma.gym.create({
      data: {
        ...gymData,
        slug: finalSlug,
        disciplines: disciplineIds.length
          ? {
              create: disciplineIds.map((disciplineId: string) => ({
                discipline: { connect: { id: disciplineId } },
              })),
            }
          : undefined,
        amenities: amenityIds.length
          ? {
              create: amenityIds.map((amenityId: string) => ({
                amenity: { connect: { id: amenityId } },
              })),
            }
          : undefined,
      },
    });

    await syncGymImages(gym.id, coverImage, galleryImages);

    const full = await prisma.gym.findUnique({
      where: { id: gym.id },
      include: {
        galleryImages: true,
        disciplines: { include: { discipline: true } },
        amenities: { include: { amenity: true } },
      },
    });

    return NextResponse.json({ data: full }, { status: 201 });
  } catch (error) {
    console.error("POST /api/gyms error:", error);
    return NextResponse.json({ error: "Failed to create gym" }, { status: 500 });
  }
}

function buildWhereClause(filters: GymFilters): Prisma.GymWhereInput {
  const where: Prisma.GymWhereInput = { listingStatus: "approved" };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { area: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.city) where.city = { equals: filters.city, mode: "insensitive" };
  if (filters.area) where.area = { equals: filters.area, mode: "insensitive" };

  if (filters.type) {
    where.type = filters.type as Prisma.EnumGymTypeFilter["equals"];
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : []),
      ...(filters.priceMin !== undefined ? [{ priceMin: { gte: filters.priceMin } }] : []),
      ...(filters.priceMax !== undefined ? [{ priceMax: { lte: filters.priceMax } }] : []),
    ];
  }

  if (filters.ladiesStatus) {
    where.ladiesStatus = filters.ladiesStatus as Prisma.EnumLadiesStatusFilter["equals"];
  }

  if (filters.discipline) {
    where.disciplines = {
      some: {
        discipline: {
          name: { equals: filters.discipline, mode: "insensitive" },
        },
      },
    };
  }

  if (filters.amenity) {
    where.amenities = {
      some: {
        amenity: {
          name: { equals: filters.amenity, mode: "insensitive" },
        },
      },
    };
  }

  if (filters.rating) {
    const ratingWhere = buildGymRatingWhere(filters.rating);
    if (ratingWhere) Object.assign(where, ratingWhere);
  }

  return where;
}

function buildOrderBy(sort?: string): Prisma.GymOrderByWithRelationInput | Prisma.GymOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ priceMin: "asc" }, { featured: "desc" }];
    case "price_desc":
      return [{ priceMax: "desc" }, { featured: "desc" }];
    case "rating":
      return [{ rating: { sort: "desc", nulls: "last" } }, { featured: "desc" }];
    case "featured":
    default:
      return [{ featured: "desc" }, { createdAt: "desc" }];
  }
}

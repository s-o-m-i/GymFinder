import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { GYM_LEVEL_IMAGE_WHERE, syncGymImages } from "@/lib/gym-images";
import { resolveAmenityIds, resolveDisciplineIds } from "@/lib/gym-tags";
import { upsertPrimaryBranchFromGym } from "@/lib/gym-branches";
import { getGymsListing } from "@/lib/getGymsListing";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const result = await getGymsListing(params);
    return NextResponse.json({
      gyms: result.gyms,
      total: result.total,
      page: result.page,
      limit: result.filters.limit ?? 12,
      totalPages: result.totalPages,
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
    const slug =
      (typeof body.slug === "string" ? slugify(body.slug) : "") ||
      slugify(`${body.name}-${body.area}-${body.city}`);
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
        claimed: false,
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

    await upsertPrimaryBranchFromGym(gym.id);
    await syncGymImages(gym.id, coverImage, galleryImages);

    const full = await prisma.gym.findUnique({
      where: { id: gym.id },
      include: {
        galleryImages: { where: GYM_LEVEL_IMAGE_WHERE },
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-auth";
import { slugify } from "@/lib/utils";
import { syncGymImages } from "@/lib/gym-images";
import { resolveAmenityIds, resolveDisciplineIds } from "@/lib/gym-tags";

const GYM_INCLUDE = {
  galleryImages: true,
  disciplines: { include: { discipline: true } },
  amenities: { include: { amenity: true } },
};

export async function GET() {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.ownerId },
    include: GYM_INCLUDE,
  });

  return NextResponse.json({ data: gym });
}

export async function POST(req: NextRequest) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.gym.findUnique({ where: { ownerId: session.ownerId } });
    if (existing) {
      return NextResponse.json(
        { error: "You already have a listing. Each account can manage one gym or fighting club." },
        { status: 409 }
      );
    }

    const body = await req.json();
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

    const slug = gymData.slug ?? slugify(`${gymData.name}-${gymData.area}-${gymData.city}`);
    const slugTaken = await prisma.gym.findUnique({ where: { slug } });
    const finalSlug = slugTaken ? `${slug}-${Date.now()}` : slug;

    const gym = await prisma.gym.create({
      data: {
        ...gymData,
        slug:          finalSlug,
        featured:      false,
        rating:        null,
        listingStatus: "pending",
        ownerId:       session.ownerId,
        disciplines: disciplineIds.length
          ? { create: disciplineIds.map((id: string) => ({ discipline: { connect: { id } } })) }
          : undefined,
        amenities: amenityIds.length
          ? { create: amenityIds.map((id: string) => ({ amenity: { connect: { id } } })) }
          : undefined,
      },
    });

    await syncGymImages(gym.id, coverImage, galleryImages);

    const full = await prisma.gym.findUnique({ where: { id: gym.id }, include: GYM_INCLUDE });
    return NextResponse.json({ data: full }, { status: 201 });
  } catch (error) {
    console.error("POST /api/owner/gym error:", error);
    return NextResponse.json({ error: "Failed to create listing." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const gym = await prisma.gym.findUnique({ where: { ownerId: session.ownerId } });
    if (!gym) {
      return NextResponse.json({ error: "No listing found." }, { status: 404 });
    }

    const body = await req.json();
    const {
      disciplines,
      customDisciplines,
      amenities,
      customAmenities,
      coverImage,
      galleryImages,
      featured,
      rating,
      listingStatus,
      ownerId,
      ...gymData
    } = body;

    const disciplineIds =
      disciplines !== undefined
        ? await resolveDisciplineIds(
            prisma,
            disciplines ?? [],
            customDisciplines ?? []
          )
        : undefined;
    const amenityIds =
      amenities !== undefined
        ? await resolveAmenityIds(prisma, amenities ?? [], customAmenities ?? [])
        : undefined;

    const updated = await prisma.gym.update({
      where: { id: gym.id },
      data: {
        ...gymData,
        ...(disciplineIds !== undefined && {
          disciplines: {
            deleteMany: {},
            create: disciplineIds.map((id: string) => ({ discipline: { connect: { id } } })),
          },
        }),
        ...(amenityIds !== undefined && {
          amenities: {
            deleteMany: {},
            create: amenityIds.map((id: string) => ({ amenity: { connect: { id } } })),
          },
        }),
      },
    });

    await syncGymImages(updated.id, coverImage, galleryImages);

    const full = await prisma.gym.findUnique({ where: { id: updated.id }, include: GYM_INCLUDE });
    return NextResponse.json({ data: full });
  } catch (error) {
    console.error("PUT /api/owner/gym error:", error);
    return NextResponse.json({ error: "Failed to update listing." }, { status: 500 });
  }
}

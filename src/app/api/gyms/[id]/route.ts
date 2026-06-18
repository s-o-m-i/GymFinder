import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const GYM_FULL_INCLUDE = {
  images: true,
  disciplines: { include: { discipline: true } },
  amenities: { include: { amenity: true } },
  reviews: { orderBy: { createdAt: "desc" as const }, take: 10 },
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Support both ID and slug lookup
    const gym = await prisma.gym.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: GYM_FULL_INCLUDE,
    });

    if (!gym) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }

    return NextResponse.json({ data: gym });
  } catch (error) {
    console.error("GET /api/gyms/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch gym" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminSecret = req.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { disciplines, amenities, images, ...gymData } = body;

    // Update slug if name changed
    if (gymData.name && !gymData.slug) {
      const gym = await prisma.gym.findUnique({ where: { id }, select: { name: true, area: true, city: true } });
      if (gym && gymData.name !== gym.name) {
        const newSlug = slugify(`${gymData.name}-${gym.area}-${gym.city}`);
        const existing = await prisma.gym.findFirst({ where: { slug: newSlug, NOT: { id } } });
        gymData.slug = existing ? `${newSlug}-${Date.now()}` : newSlug;
      }
    }

    const gym = await prisma.gym.update({
      where: { id },
      data: {
        ...gymData,
        ...(disciplines !== undefined && {
          disciplines: {
            deleteMany: {},
            create: disciplines.map((disciplineId: string) => ({
              discipline: { connect: { id: disciplineId } },
            })),
          },
        }),
        ...(amenities !== undefined && {
          amenities: {
            deleteMany: {},
            create: amenities.map((amenityId: string) => ({
              amenity: { connect: { id: amenityId } },
            })),
          },
        }),
        ...(images !== undefined && {
          images: {
            deleteMany: {},
            create: images.map((url: string) => ({ url })),
          },
        }),
      },
      include: GYM_FULL_INCLUDE,
    });

    return NextResponse.json({ data: gym });
  } catch (error) {
    console.error("PUT /api/gyms/[id] error:", error);
    return NextResponse.json({ error: "Failed to update gym" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminSecret = req.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.gym.delete({ where: { id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("DELETE /api/gyms/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete gym" }, { status: 500 });
  }
}

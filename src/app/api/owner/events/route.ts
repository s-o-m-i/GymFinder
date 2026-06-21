import { NextRequest, NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { createEventSchema } from "@/lib/validations/event";
import type { EventType } from "@prisma/client";
import {
  createEvent,
  generateUniqueEventSlug,
  getOwnerEvents,
} from "@/services/events/event.service";

export async function GET() {
  try {
    const session = await getOwnerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await getOwnerEvents(session.ownerId);
    return NextResponse.json({ events });
  } catch (error) {
    console.error("GET /api/owner/events error:", error);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getOwnerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const gym = await prisma.gym.findUnique({
      where: { ownerId: session.ownerId },
      select: { id: true, city: true, area: true, address: true },
    });

    const slug = await generateUniqueEventSlug(data.title, data.city);

    const event = await createEvent({
      title: data.title.trim(),
      slug,
      description: data.description?.trim() || null,
      type: data.type as EventType,
      city: data.city,
      area: data.area?.trim() || gym?.area || null,
      address: data.address?.trim() || gym?.address || null,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      image: data.image ?? null,
      cloudinaryId: data.cloudinaryId ?? null,
      price: data.price ?? null,
      isFeatured: data.isFeatured ?? false,
      gymId: gym?.id ?? null,
      createdByOwnerId: session.ownerId,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("POST /api/owner/events error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

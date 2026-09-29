import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTrainersListing } from "@/services/trainer/trainer.service";
import { getEventsListing } from "@/services/events/event.service";
import { listPublicSuccessStories } from "@/services/success-story/success-story.service";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ error: "Search query must be at least 2 characters." }, { status: 400 });

  try {
    const [gyms, trainers, events, stories] = await Promise.all([
      prisma.gym.findMany({
        where: { listingStatus: "approved", OR: [
          { name: { contains: q, mode: "insensitive" } },
          { area: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          { branches: { some: { status: "ACTIVE", OR: [
            { name: { contains: q, mode: "insensitive" } },
            { area: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
          ] } } },
        ] },
        select: { id: true, name: true, slug: true, type: true, area: true, city: true, latitude: true, longitude: true, priceMin: true, priceMax: true, rating: true, featured: true, claimed: true, coverImage: true },
        take: 8,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      }),
      getTrainersListing({ search: q, page: "1" }),
      getEventsListing({ search: q, page: "1", time: "upcoming" }),
      listPublicSuccessStories({ q, page: 1 }),
    ]);

    return NextResponse.json({
      gyms,
      trainers: trainers.trainers,
      events: events.events,
      successStories: stories.items,
    });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ error: "Failed to search FitnessAdda." }, { status: 500 });
  }
}

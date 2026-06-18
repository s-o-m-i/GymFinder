import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDistance } from "@/lib/getDistance";

const NEARBY_GYM_SELECT = {
  id: true,
  name: true,
  slug: true,
  type: true,
  area: true,
  city: true,
  priceMin: true,
  priceMax: true,
  ladiesStatus: true,
  sizeCategory: true,
  whatsappNumber: true,
  rating: true,
  featured: true,
  openingHours: true,
  latitude: true,
  longitude: true,
  images: { select: { url: true, alt: true }, take: 1 },
  disciplines: {
    select: {
      discipline: { select: { name: true } },
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lat, lng, radius = 20 } = body as {
      lat: number;
      lng: number;
      radius?: number;
    };

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "lat and lng are required numbers." },
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: "Invalid coordinates." },
        { status: 400 }
      );
    }

    const radiusKm = Math.min(Math.max(Number(radius), 1), 100);

    // Fetch all gyms that have coordinates
    const gyms = await prisma.gym.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: NEARBY_GYM_SELECT,
    });

    if (gyms.length === 0) {
      return NextResponse.json({ gyms: [], total: 0, radius: radiusKm });
    }

    // Calculate distance and filter/sort
    const withDistance = gyms
      .map((gym) => ({
        ...gym,
        distanceKm: getDistance(lat, lng, gym.latitude!, gym.longitude!),
      }))
      .filter((gym) => gym.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({
      gyms: withDistance,
      total: withDistance.length,
      userLat: lat,
      userLng: lng,
      radius: radiusKm,
    });
  } catch (error) {
    console.error("POST /api/gyms/nearby error:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby gyms." },
      { status: 500 }
    );
  }
}

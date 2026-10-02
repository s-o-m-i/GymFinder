import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDistance } from "@/lib/getDistance";
import { toGymCardDataFromBranch } from "@/lib/gym-branch-listing";
import {
  pickListingCoordinates,
  resolveListingCoordinates,
} from "@/lib/listing-coordinates";
import type { GymCardDataWithDistance } from "@/types";

const MAX_GEOCODES_PER_REQUEST = 5;

const NEARBY_GYM_SELECT = {
  id: true,
  name: true,
  slug: true,
  type: true,
  customTypeLabel: true,
  priceMin: true,
  priceMax: true,
  ladiesStatus: true,
  sizeCategory: true,
  whatsappNumber: true,
  rating: true,
  featured: true,
  featuredUntil: true,
  openingHours: true,
  ladiesHours: true,
  coverImage: true,
  latitude: true,
  longitude: true,
  galleryImages: {
    where: { branchId: null },
    select: { imageUrl: true, alt: true },
    take: 1,
  },
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

    const branches = await prisma.gymBranch.findMany({
      where: {
        status: "ACTIVE",
        gym: { listingStatus: "approved" },
      },
      select: {
        id: true,
        gymId: true,
        name: true,
        slug: true,
        listingSlug: true,
        address: true,
        area: true,
        city: true,
        latitude: true,
        longitude: true,
        openingHours: true,
        ladiesHours: true,
        whatsappNumber: true,
        priceMin: true,
        priceMax: true,
        ladiesStatus: true,
        sizeCategory: true,
        coverImage: true,
        useCommonHours: true,
        useCommonDisciplines: true,
        galleryImages: { select: { imageUrl: true, alt: true }, take: 1 },
        disciplines: {
          select: { discipline: { select: { name: true } } },
        },
        gym: { select: NEARBY_GYM_SELECT },
      },
    });

    if (branches.length === 0) {
      return NextResponse.json({ gyms: [], total: 0, radius: radiusKm });
    }

    let remainingGeocodes = MAX_GEOCODES_PER_REQUEST;
    const withDistance: GymCardDataWithDistance[] = [];

    for (const branch of branches) {
      const needsGeocode = !pickListingCoordinates(branch);
      const point = await resolveListingCoordinates(branch, {
        geocodeIfMissing: remainingGeocodes > 0,
      });
      if (needsGeocode && remainingGeocodes > 0) remainingGeocodes -= 1;
      if (!point) continue;

      const card = toGymCardDataFromBranch(branch);
      const distanceKm = getDistance(lat, lng, point.latitude, point.longitude);
      if (distanceKm > radiusKm) continue;

      withDistance.push({
        ...card,
        latitude: point.latitude,
        longitude: point.longitude,
        distanceKm,
      });
    }

    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);

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

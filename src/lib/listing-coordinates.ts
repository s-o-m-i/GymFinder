import { prisma } from "@/lib/prisma";
import { geocodeAddress, type GeoPoint } from "@/lib/geocode";

export type ListingCoordinateSource = {
  id: string;
  gymId: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  area: string;
  city: string;
  gym: {
    latitude: number | null;
    longitude: number | null;
  };
};

export function pickListingCoordinates(source: {
  latitude: number | null;
  longitude: number | null;
  gym?: { latitude: number | null; longitude: number | null } | null;
}): GeoPoint | null {
  const latitude = source.latitude ?? source.gym?.latitude ?? null;
  const longitude = source.longitude ?? source.gym?.longitude ?? null;
  if (latitude == null || longitude == null) return null;
  return { latitude, longitude };
}

export async function persistListingCoordinates(
  source: ListingCoordinateSource,
  point: GeoPoint
) {
  await prisma.gymBranch.update({
    where: { id: source.id },
    data: { latitude: point.latitude, longitude: point.longitude },
  });

  if (source.gym.latitude == null || source.gym.longitude == null) {
    await prisma.gym.update({
      where: { id: source.gymId },
      data: { latitude: point.latitude, longitude: point.longitude },
    });
  }
}

export async function resolveListingCoordinates(
  source: ListingCoordinateSource,
  options?: { geocodeIfMissing?: boolean }
): Promise<GeoPoint | null> {
  const existing = pickListingCoordinates(source);
  if (existing) return existing;
  if (!options?.geocodeIfMissing) return null;

  const point = await geocodeAddress({
    address: source.address,
    area: source.area,
    city: source.city,
  });
  if (!point) return null;

  await persistListingCoordinates(source, point);
  return point;
}

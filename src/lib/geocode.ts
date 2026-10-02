const NOMINATIM_USER_AGENT = "GymFinderPK/1.0 (gymfinderpk@gmail.com)";

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type GeocodeQueryInput = {
  address?: string | null;
  area?: string | null;
  city?: string | null;
};

function cleanAddress(address: string) {
  return address
    .replace(/\b\d+\s*(st|nd|rd|th)?\s*floor\b/gi, " ")
    .replace(/\bfloor\b/gi, " ")
    .replace(/[,/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildGeocodeQueries(input: GeocodeQueryInput): string[] {
  const address = cleanAddress(input.address ?? "");
  const area = (input.area ?? "").trim();
  const city = (input.city ?? "").trim();
  const queries: string[] = [];

  if (address && area && city) queries.push(`${address}, ${area}, ${city}, Pakistan`);
  if (address && city) queries.push(`${address}, ${city}, Pakistan`);
  if (area && city) queries.push(`${area}, ${city}, Pakistan`);
  if (city) queries.push(`${city}, Pakistan`);

  return [...new Set(queries.filter(Boolean))];
}

async function searchNominatim(query: string): Promise<GeoPoint | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "pk");
  url.searchParams.set("q", query);

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": NOMINATIM_USER_AGENT,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
  const first = data[0];
  const latitude = first?.lat ? Number(first.lat) : NaN;
  const longitude = first?.lon ? Number(first.lon) : NaN;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function geocodeAddress(input: GeocodeQueryInput): Promise<GeoPoint | null> {
  const queries = buildGeocodeQueries(input);

  for (const [index, query] of queries.entries()) {
    if (index > 0) await sleep(1100);
    const point = await searchNominatim(query);
    if (point) return point;
  }

  return null;
}

export async function fillMissingCoordinates<T extends GeocodeQueryInput & {
  latitude?: number | null;
  longitude?: number | null;
}>(input: T): Promise<T> {
  if (input.latitude != null && input.longitude != null) return input;

  const point = await geocodeAddress(input);
  if (!point) return input;

  return {
    ...input,
    latitude: point.latitude,
    longitude: point.longitude,
  };
}

import { CITIES, GYM_TYPES, type City, cityNameToSlug, citySlugToName } from "@/lib/constants";
import { getCitySeoCopy } from "@/lib/pakistan-cities";
import { gymTypeLabel } from "@/lib/utils";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

/** URL slug → display city name */
export const CITY_SLUG_MAP: Record<string, City> = Object.fromEntries(
  CITIES.map((city) => [cityNameToSlug(city)!, city])
) as Record<string, City>;

/** URL slug → gym type value (DB enum) */
export const TYPE_SLUG_MAP: Record<string, string> = {
  gym:          "gym",
  boxing:       "boxing",
  mma:          "mma",
  "muay-thai":  "muay_thai",
  kickboxing:   "kickboxing",
  "martial-arts": "martial_arts",
};

export function getGymCitySeo(city: City) {
  return getCitySeoCopy(city);
}

export const TYPE_SEO: Record<string, { title: string; description: string; keywords: string[] }> = {
  gym: {
    title:       "Best Gyms in Pakistan",
    description:
      "Find the best fitness gyms across Pakistan. Compare monthly membership fees, equipment, facilities, and contact gyms directly on WhatsApp.",
    keywords: ["gyms Pakistan", "fitness centers Pakistan", "best gyms Pakistan"],
  },
  boxing: {
    title:       "Best Boxing Clubs in Pakistan",
    description:
      "Discover top boxing clubs and boxing gyms across Pakistan. Compare prices, training programs, and contact coaches directly on WhatsApp.",
    keywords: ["boxing clubs Pakistan", "boxing gyms Pakistan", "boxing training Pakistan"],
  },
  mma: {
    title:       "Best MMA Gyms in Pakistan",
    description:
      "Find MMA gyms and mixed martial arts academies across Pakistan. Compare facilities, coaches, and membership prices. Contact on WhatsApp.",
    keywords: ["MMA gym Pakistan", "mixed martial arts Pakistan", "MMA training Pakistan"],
  },
  muay_thai: {
    title:       "Muay Thai Gyms in Pakistan",
    description:
      "Browse Muay Thai gyms and training centers across Pakistan. Compare prices and contact directly on WhatsApp.",
    keywords: ["Muay Thai Pakistan", "Muay Thai gym Pakistan"],
  },
  kickboxing: {
    title:       "Kickboxing Gyms in Pakistan",
    description:
      "Find kickboxing gyms and classes across Pakistan. Compare membership fees and contact on WhatsApp.",
    keywords: ["kickboxing Pakistan", "kickboxing gym Pakistan"],
  },
  martial_arts: {
    title:       "Martial Arts Clubs in Pakistan",
    description:
      "Discover martial arts academies and dojos across Pakistan. Filter by discipline, price, and area.",
    keywords: ["martial arts Pakistan", "martial arts gym Pakistan"],
  },
};

export { citySlugToName, cityNameToSlug };

export function typeSlugToValue(slug: string): string | null {
  return TYPE_SLUG_MAP[slug.toLowerCase()] ?? null;
}

export function typeValueToSlug(type: string): string | null {
  const entry = Object.entries(TYPE_SLUG_MAP).find(([, value]) => value === type);
  return entry?.[0] ?? null;
}

export function isListingSlug(slug: string): boolean {
  const s = slug.toLowerCase();
  return s in CITY_SLUG_MAP || s in TYPE_SLUG_MAP;
}

export function getGymsBasePath(opts?: { city?: string; type?: string }): string {
  const { city, type } = opts ?? {};
  if (city) {
    const slug = cityNameToSlug(city);
    if (slug) return `/gyms/${slug}`;
  }
  if (type) {
    const slug = typeValueToSlug(type);
    if (slug) return `/gyms/${slug}`;
  }
  return "/gyms";
}

/** @deprecated Use getGymsBasePath({ city }) */
export function getGymsBasePathLegacy(city?: string): string {
  return getGymsBasePath(city ? { city } : undefined);
}

export function parseCityFromPath(pathname: string): City | null {
  const match = pathname.match(/^\/gyms\/([^/?]+)/);
  if (!match) return null;
  return citySlugToName(match[1]);
}

export function parseTypeFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/gyms\/([^/?]+)/);
  if (!match) return null;
  return typeSlugToValue(match[1]);
}

export function buildGymsUrl(
  opts?: { city?: string; type?: string },
  params?: Record<string, string | number | undefined>
): string {
  const base = getGymsBasePath(opts);
  if (!params) return base;

  const sp = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "" && key !== "city" && key !== "type") {
      sp.set(key, String(val));
    }
  }
  if (opts?.city && params.type) sp.set("type", String(params.type));
  if (opts?.type && params.city) sp.set("city", String(params.city));

  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export const ALL_CITY_SLUGS = CITIES.map((c) => cityNameToSlug(c)!);
export const ALL_TYPE_SLUGS = GYM_TYPES.map((t) => typeValueToSlug(t.value)!);
export const ALL_LISTING_SLUGS = [...ALL_CITY_SLUGS, ...ALL_TYPE_SLUGS];

export function generateListingMetadata({
  slug,
  city,
  type,
  searchParams = {},
}: {
  slug: string;
  city?: City;
  type?: string;
  searchParams?: Record<string, string | string[] | undefined>;
}): Metadata {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const area = searchParams.area as string | undefined;
  const extraType = searchParams.type as string | undefined;

  let title = "Gyms & Fighting Clubs in Pakistan";
  let description = "Browse gyms and fighting clubs across Pakistan.";
  let keywords: string[] = [];

  if (city) {
    const seo = getGymCitySeo(city);
    title = seo.title;
    description = seo.description;
    keywords = seo.keywords;
    if (extraType) title = `${gymTypeLabel(extraType)} in ${city}`;
    if (area) title = `Gyms in ${area}, ${city}`;
  } else if (type) {
    const seo = TYPE_SEO[type];
    if (seo) {
      title = seo.title;
      description = seo.description;
      keywords = seo.keywords;
    } else {
      title = `${gymTypeLabel(type)} Gyms in Pakistan`;
    }
  }

  const canonical = `${base}/gyms/${slug}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title:       `${title} | ${SITE_NAME}`,
      description,
      url:         canonical,
      type:        "website",
      locale:      "en_PK",
    },
    robots: { index: true, follow: true },
  };
}

/** @deprecated Use getGymCitySeo */
export const CITY_SEO = Object.fromEntries(
  CITIES.map((city) => [city, getCitySeoCopy(city)])
) as Record<City, ReturnType<typeof getCitySeoCopy>>;

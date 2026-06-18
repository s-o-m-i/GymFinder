import { CITIES, GYM_TYPES, type City } from "@/lib/constants";
import { gymTypeLabel } from "@/lib/utils";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

/** URL slug → display city name */
export const CITY_SLUG_MAP: Record<string, City> = {
  rawalpindi: "Rawalpindi",
  islamabad:  "Islamabad",
};

/** URL slug → gym type value (DB enum) */
export const TYPE_SLUG_MAP: Record<string, string> = {
  gym:          "gym",
  boxing:       "boxing",
  mma:          "mma",
  "muay-thai":  "muay_thai",
  kickboxing:   "kickboxing",
  "martial-arts": "martial_arts",
};

export const CITY_SEO: Record<City, { title: string; description: string; keywords: string[] }> = {
  Rawalpindi: {
    title:       "Best Gyms & Fighting Clubs in Rawalpindi",
    description:
      "Discover gyms, boxing clubs, MMA academies, and martial arts centers in Rawalpindi. Compare monthly fees, facilities, ladies timings, and contact gyms directly on WhatsApp.",
    keywords: [
      "gyms in Rawalpindi",
      "boxing clubs Rawalpindi",
      "MMA gym Rawalpindi",
      "fighting clubs Rawalpindi",
      "fitness centers Rawalpindi",
      "ladies gym Rawalpindi",
    ],
  },
  Islamabad: {
    title:       "Best Gyms & Fighting Clubs in Islamabad",
    description:
      "Find top gyms, boxing clubs, MMA gyms, and martial arts studios in Islamabad. Filter by area, price, and discipline. Contact directly on WhatsApp — no booking fees.",
    keywords: [
      "gyms in Islamabad",
      "boxing clubs Islamabad",
      "MMA gym Islamabad",
      "fighting clubs Islamabad",
      "fitness centers Islamabad",
      "ladies gym Islamabad",
    ],
  },
};

export const TYPE_SEO: Record<string, { title: string; description: string; keywords: string[] }> = {
  gym: {
    title:       "Best Gyms in Rawalpindi & Islamabad",
    description:
      "Find the best fitness gyms in Rawalpindi and Islamabad. Compare monthly membership fees, equipment, facilities, and contact gyms directly on WhatsApp.",
    keywords: ["gyms Rawalpindi Islamabad", "fitness centers Pakistan", "best gyms twin cities"],
  },
  boxing: {
    title:       "Best Boxing Clubs in Rawalpindi & Islamabad",
    description:
      "Discover top boxing clubs and boxing gyms in Rawalpindi and Islamabad. Compare prices, training programs, and contact coaches directly on WhatsApp.",
    keywords: ["boxing clubs Rawalpindi", "boxing gyms Islamabad", "boxing training Pakistan"],
  },
  mma: {
    title:       "Best MMA Gyms in Rawalpindi & Islamabad",
    description:
      "Find MMA gyms and mixed martial arts academies in Rawalpindi and Islamabad. Compare facilities, coaches, and membership prices. Contact on WhatsApp.",
    keywords: ["MMA gym Rawalpindi", "MMA gym Islamabad", "mixed martial arts Pakistan"],
  },
  muay_thai: {
    title:       "Muay Thai Gyms in Rawalpindi & Islamabad",
    description:
      "Browse Muay Thai gyms and training centers in Rawalpindi and Islamabad. Compare prices and contact directly on WhatsApp.",
    keywords: ["Muay Thai Rawalpindi", "Muay Thai Islamabad", "Muay Thai gym Pakistan"],
  },
  kickboxing: {
    title:       "Kickboxing Gyms in Rawalpindi & Islamabad",
    description:
      "Find kickboxing gyms and classes in Rawalpindi and Islamabad. Compare membership fees and contact on WhatsApp.",
    keywords: ["kickboxing Rawalpindi", "kickboxing Islamabad", "kickboxing gym Pakistan"],
  },
  martial_arts: {
    title:       "Martial Arts Clubs in Rawalpindi & Islamabad",
    description:
      "Discover martial arts academies and dojos in Rawalpindi and Islamabad. Filter by discipline, price, and area.",
    keywords: ["martial arts Rawalpindi", "martial arts Islamabad", "martial arts gym Pakistan"],
  },
};

export function citySlugToName(slug: string): City | null {
  return CITY_SLUG_MAP[slug.toLowerCase()] ?? null;
}

export function cityNameToSlug(city: string): string | null {
  const entry = Object.entries(CITY_SLUG_MAP).find(
    ([, name]) => name.toLowerCase() === city.toLowerCase()
  );
  return entry?.[0] ?? null;
}

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
  // Secondary dimension as query when not in path
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

  let title = "Gyms in Rawalpindi & Islamabad";
  let description = "Browse gyms and fighting clubs in Rawalpindi and Islamabad.";
  let keywords: string[] = [];

  if (city) {
    const seo = CITY_SEO[city];
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
      title = `${gymTypeLabel(type)} Gyms in Rawalpindi & Islamabad`;
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

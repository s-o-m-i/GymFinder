import {
  PAKISTAN_CITIES,
  type PakistanCity,
  cityNameToSlug,
  citySlugToName,
  isKnownCity,
  slugifyCity,
} from "@/lib/pakistan-cities";

export const CITIES = PAKISTAN_CITIES;
export type City = PakistanCity;

export { cityNameToSlug, citySlugToName, isKnownCity, slugifyCity };

/** Select value when the owner enters a custom primary discipline / type. */
export const CUSTOM_TYPE_VALUE = "__custom__";

export const GYM_TYPES = [
  { value: "gym",          label: "Gym" },
  { value: "boxing",       label: "Boxing" },
  { value: "mma",          label: "MMA" },
  { value: "muay_thai",    label: "Muay Thai" },
  { value: "kickboxing",   label: "Kickboxing" },
  { value: "martial_arts", label: "Martial Arts" },
] as const;

export const LADIES_STATUS_OPTIONS = [
  { value: "mixed", label: "Mixed (Open to All)" },
  { value: "ladies_only", label: "Ladies Only" },
  {
    value: "ladies_timings",
    label: "Mixed — with Ladies-Only Hours",
    description: "General mixed access plus dedicated women's-only training hours.",
  },
  { value: "men_only", label: "Men Only" },
] as const;

export const SIZE_CATEGORIES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
] as const;

export const RAWALPINDI_AREAS = [
  "Saddar",
  "Bahria Town",
  "DHA Phase 1",
  "DHA Phase 2",
  "Westridge",
  "Satellite Town",
  "Chaklala",
  "Gulraiz",
  "Askari",
  "Lalazar",
  "Pindora",
  "Dhok Kala Khan",
  "Committee Chowk",
  "Raja Bazar",
  "Murree Road",
];

export const ISLAMABAD_AREAS = [
  "F-6",
  "F-7",
  "F-8",
  "F-10",
  "F-11",
  "G-9",
  "G-10",
  "G-11",
  "G-13",
  "I-8",
  "I-10",
  "Blue Area",
  "Bahria Town",
  "DHA Phase 1",
  "DHA Phase 2",
  "Bani Gala",
  "Margalla",
  "Srinagar Highway",
  "PWD",
  "Gulberg",
];

export const ALL_AREAS = [
  ...RAWALPINDI_AREAS.map((a) => ({ area: a, city: "Rawalpindi" })),
  ...ISLAMABAD_AREAS.map((a) => ({ area: a, city: "Islamabad" })),
];

export function getAreasForCity(city: string): readonly string[] {
  if (city === "Rawalpindi") return RAWALPINDI_AREAS;
  if (city === "Islamabad") return ISLAMABAD_AREAS;
  return [];
}

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi, I found your gym on FitnessAdda PK. I want more details about membership.";

export const SITE_NAME = "FitnessAdda PK";
/** Cache-bust when replacing public/images/Logo.png */
export const SITE_LOGO_SRC = "/images/Logo.png?v=3";
export const SITE_TAGLINE = "Find Gyms • Trainers • Fighting Clubs";
export const SITE_DESCRIPTION =
  "Discover the best gyms, fighting clubs, and personal trainers across Pakistan. Compare prices, facilities, and contact directly on WhatsApp.";

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/gymfinderpk",
  facebook:  "https://facebook.com/gymfinderpk",
  twitter:   "https://twitter.com/gymfinderpk",
  tiktok:    "https://tiktok.com/@gymfinderpk",
} as const;

export const PRICE_RANGE = { min: 0, max: 15000 };

export type GymRatingFilterOption = {
  value: string;
  label: string;
  min?: number;
  max?: number;
  unrated?: boolean;
};

/** Full rating coverage — minimum thresholds, star bands, and unrated gyms */
export const GYM_RATING_FILTERS: readonly GymRatingFilterOption[] = [
  { value: "4_5", label: "4.5+ stars", min: 4.5 },
  { value: "4", label: "4+ stars", min: 4 },
  { value: "3_5", label: "3.5+ stars", min: 3.5 },
  { value: "3", label: "3+ stars", min: 3 },
  { value: "2_plus", label: "2+ stars", min: 2 },
  { value: "2", label: "2 stars (2.0 – 2.9)", min: 2, max: 3 },
  { value: "1_plus", label: "1+ stars", min: 1 },
  { value: "1", label: "1 star (1.0 – 1.9)", min: 1, max: 2 },
  { value: "under_1", label: "Under 1 star", max: 1 },
  { value: "none", label: "No rating yet", unrated: true },
] as const;

export type GymRatingFilter = (typeof GYM_RATING_FILTERS)[number]["value"];

export function buildGymRatingWhere(
  value: string
): { rating: null } | { rating: { gte?: number; lt?: number } } | null {
  const match = GYM_RATING_FILTERS.find((r) => r.value === value);
  if (!match) return null;

  if (match.unrated) {
    return { rating: null };
  }

  if (match.min !== undefined && match.max !== undefined) {
    return { rating: { gte: match.min, lt: match.max } };
  }
  if (match.min !== undefined) {
    return { rating: { gte: match.min } };
  }
  if (match.max !== undefined) {
    return { rating: { lt: match.max } };
  }

  return null;
}

/** @deprecated Use buildGymRatingWhere */
export function gymRatingMin(value: string): number | null {
  const match = GYM_RATING_FILTERS.find((r) => r.value === value);
  return match?.min ?? null;
}

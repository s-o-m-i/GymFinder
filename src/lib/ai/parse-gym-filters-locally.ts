import type { GymType, LadiesStatus } from "@prisma/client";
import { PAKISTAN_CITIES } from "@/lib/pakistan-cities";
import type { GymSearchFilters } from "@/types/gym-search";

const GYM_TYPE_PATTERNS: { pattern: RegExp; type: GymType }[] = [
  { pattern: /\bboxing\b/i, type: "boxing" },
  { pattern: /\bmma\b/i, type: "mma" },
  { pattern: /\bmuay\s*thai\b/i, type: "muay_thai" },
  { pattern: /\bkickboxing\b/i, type: "kickboxing" },
  { pattern: /\bmartial\s*arts?\b/i, type: "martial_arts" },
  { pattern: /\b(fitness|weightlifting|gym)\b/i, type: "gym" },
];

const LADIES_PATTERNS: { pattern: RegExp; status: LadiesStatus }[] = [
  { pattern: /\bladies[\s-]?only\b|\bwomen[\s-]?only\b|\bfemale[\s-]?only\b/i, status: "ladies_only" },
  { pattern: /\bladies[\s-]?timing/i, status: "ladies_timings" },
  { pattern: /\bmen[\s-]?only\b|\bgents[\s-]?only\b/i, status: "men_only" },
];

const AMENITY_PATTERNS: { pattern: RegExp; name: string }[] = [
  { pattern: /\bparking\b/i, name: "Parking" },
  { pattern: /\bpersonal\s+train/i, name: "Personal Training" },
  { pattern: /\bsauna\b/i, name: "Sauna" },
  { pattern: /\bwifi\b|\bwi-fi\b/i, name: "WiFi" },
  { pattern: /\blocker\b|\blockers\b/i, name: "Lockers" },
  { pattern: /\bsteam\b/i, name: "Steam Room" },
  { pattern: /\bpool\b|\bswimming\b/i, name: "Swimming Pool" },
];

const AREA_PATTERNS = [
  /\b(?:near|in|at)\s+([a-z0-9][a-z0-9\s-]{2,40}?)(?:\s+(?:under|below|above|in|pakistan|pkr|rs)|[,.]|$)/i,
  /\b(bahria\s+town(?:\s+phase\s+\d+)?)\b/i,
  /\b(dha(?:\s+phase\s+\d+)?)\b/i,
  /\b(f-\d+(?:\s+markaz)?)\b/i,
  /\b(g-\d+(?:\s+markaz)?)\b/i,
  /\b(i-\d+(?:\s+markaz)?)\b/i,
  /\b(gulberg(?:\s+\d+)?)\b/i,
  /\b(model\s+town)\b/i,
  /\b(johar\s+town)\b/i,
  /\b(clifton)\b/i,
  /\b(saddar)\b/i,
];

function titleCaseArea(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .replace(/\bDha\b/g, "DHA")
    .replace(/\bF-(\d+)/gi, (_, n) => `F-${n}`)
    .replace(/\bG-(\d+)/gi, (_, n) => `G-${n}`)
    .replace(/\bI-(\d+)/gi, (_, n) => `I-${n}`);
}

function extractCity(query: string): string | undefined {
  const lower = query.toLowerCase();
  for (const city of PAKISTAN_CITIES) {
    if (lower.includes(city.toLowerCase())) return city;
  }
  return undefined;
}

function extractPrice(query: string): Pick<GymSearchFilters, "priceMin" | "priceMax"> {
  const result: Pick<GymSearchFilters, "priceMin" | "priceMax"> = {};

  const underMatch = query.match(/\b(?:under|below|less than|max|upto|up to)\s*(?:pkr|rs\.?|₨)?\s*([\d,]+)\b/i);
  if (underMatch) {
    result.priceMax = Number(underMatch[1].replace(/,/g, ""));
    return result;
  }

  const aboveMatch = query.match(/\b(?:above|over|more than|min|from)\s*(?:pkr|rs\.?|₨)?\s*([\d,]+)\b/i);
  if (aboveMatch) {
    result.priceMin = Number(aboveMatch[1].replace(/,/g, ""));
    return result;
  }

  const barePrice = query.match(/\b([\d,]{3,})\s*(?:pkr|rs\.?|₨|\/month)?\b/i);
  if (barePrice && /\b(under|below|budget|affordable|cheap)\b/i.test(query)) {
    result.priceMax = Number(barePrice[1].replace(/,/g, ""));
    return result;
  }

  if (/\b(affordable|budget|cheap|economical)\b/i.test(query)) {
    result.priceMax = 5000;
  } else if (/\b(premium|luxury|high[\s-]?end)\b/i.test(query)) {
    result.priceMin = 10000;
  }

  return result;
}

function extractArea(query: string, city?: string): string | undefined {
  for (const pattern of AREA_PATTERNS) {
    const match = query.match(pattern);
    if (match?.[1]) {
      const area = titleCaseArea(match[1]);
      if (city && area.toLowerCase() === city.toLowerCase()) continue;
      if (area.length >= 2) return area;
    }
  }
  return undefined;
}

/**
 * Rule-based filter extraction when Gemini is unavailable or quota-limited.
 */
export function parseGymFiltersLocally(query: string): GymSearchFilters {
  const trimmed = query.trim();
  if (!trimmed) return {};

  const filters: GymSearchFilters = {};

  const city = extractCity(trimmed);
  if (city) filters.city = city;

  const area = extractArea(trimmed, city);
  if (area) filters.area = area;

  for (const { pattern, type } of GYM_TYPE_PATTERNS) {
    if (pattern.test(trimmed)) {
      filters.gymType = type;
      break;
    }
  }

  for (const { pattern, status } of LADIES_PATTERNS) {
    if (pattern.test(trimmed)) {
      filters.ladiesStatus = status;
      break;
    }
  }

  Object.assign(filters, extractPrice(trimmed));

  if (/\b(beginner|beginners|newbie)\b/i.test(trimmed)) {
    filters.searchTerm = filters.searchTerm ?? "beginner";
    if (!filters.gymType) filters.gymType = "gym";
  }

  if (/\b(featured|best|top|popular)\b/i.test(trimmed)) {
    filters.featured = true;
  }

  const ratingMatch = trimmed.match(/\b(\d(?:\.\d)?)\s*\+?\s*(?:star|stars|rating)\b/i);
  if (ratingMatch) {
    filters.ratingMin = Number(ratingMatch[1]);
  }

  const amenities: string[] = [];
  for (const { pattern, name } of AMENITY_PATTERNS) {
    if (pattern.test(trimmed)) amenities.push(name);
  }
  if (amenities.length) filters.amenityNames = amenities;

  const hasStructuredFilter =
    filters.city ||
    filters.area ||
    filters.gymType ||
    filters.ladiesStatus ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.featured ||
    filters.ratingMin !== undefined ||
    (filters.amenityNames?.length ?? 0) > 0;

  if (!hasStructuredFilter) {
    filters.searchTerm = trimmed;
  }

  return filters;
}

export function isGeminiQuotaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { status?: number; message?: string };
  return e.status === 429 || /quota|rate.?limit|too many requests/i.test(e.message ?? "");
}

export function isGeminiModelNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { status?: number; message?: string };
  return (
    e.status === 404 ||
    /not found|is not supported for generateContent/i.test(e.message ?? "")
  );
}

/** Errors where we should try the next model or fall back locally without noisy logs. */
export function isGeminiRecoverableError(err: unknown): boolean {
  return isGeminiQuotaError(err) || isGeminiModelNotFoundError(err);
}

import { z } from "zod";

const gymTypeValues = [
  "gym",
  "boxing",
  "mma",
  "muay_thai",
  "kickboxing",
  "martial_arts",
] as const;

const ladiesStatusValues = [
  "mixed",
  "ladies_only",
  "ladies_timings",
  "men_only",
] as const;

const sizeCategoryValues = ["small", "medium", "large"] as const;

const optString = z.preprocess((v) => {
  if (v == null || v === "") return undefined;
  const s = String(v).trim();
  return s.length > 0 ? s : undefined;
}, z.string().min(1).optional());

const optEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v == null || v === "" ? undefined : v),
    z.enum(values).optional()
  );

export const geminiGymFiltersSchema = z.object({
  city: optString,
  area: optString,
  gymType: optEnum(gymTypeValues),
  ladiesStatus: optEnum(ladiesStatusValues),
  priceMin: z.preprocess(
    (v) => (v == null || v === "" ? undefined : Math.round(Number(v))),
    z.number().int().nonnegative().optional()
  ),
  priceMax: z.preprocess(
    (v) => (v == null || v === "" ? undefined : Math.round(Number(v))),
    z.number().int().positive().optional()
  ),
  sizeCategory: optEnum(sizeCategoryValues),
  featured: z.preprocess(
    (v) => (v == null ? undefined : v),
    z.boolean().optional()
  ),
  ratingMin: z.preprocess(
    (v) => (v == null || v === "" ? undefined : Number(v)),
    z.number().min(0).max(5).optional()
  ),
  disciplineNames: z.preprocess(
    (v) => {
      if (!Array.isArray(v)) return undefined;
      const arr = v.map((s) => String(s).trim()).filter(Boolean);
      return arr.length > 0 ? arr : undefined;
    },
    z.array(z.string().min(1)).optional()
  ),
  amenityNames: z.preprocess(
    (v) => {
      if (!Array.isArray(v)) return undefined;
      const arr = v.map((s) => String(s).trim()).filter(Boolean);
      return arr.length > 0 ? arr : undefined;
    },
    z.array(z.string().min(1)).optional()
  ),
  searchTerm: optString,
});

export const aiGymSearchRequestSchema = z.object({
  query: z.string().trim().min(2, "Please enter at least 2 characters").max(500),
});

export type RawGeminiGymFilters = z.infer<typeof geminiGymFiltersSchema>;

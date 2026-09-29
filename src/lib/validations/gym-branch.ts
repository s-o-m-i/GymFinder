import { z } from "zod";
import { GYM_BRANCH_STATUSES } from "@/lib/gym-branch-rules";

function emptyToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

const optionalContact = z
  .string()
  .optional()
  .nullable()
  .transform(emptyToNull)
  .pipe(z.string().max(40).nullable());

function optionalCoord(min: number, max: number, label: string) {
  return z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === null || value === undefined || value === "") return null;
      const n = typeof value === "number" ? value : Number(value);
      return Number.isFinite(n) ? n : Number.NaN;
    })
    .pipe(
      z
        .number()
        .min(min, `${label} is out of range`)
        .max(max, `${label} is out of range`)
        .nullable()
    );
}

function optionalNullableInt(min?: number, max?: number) {
  let schema = z.number().int();
  if (min !== undefined) schema = schema.min(min);
  if (max !== undefined) schema = schema.max(max);
  return z.preprocess((value) => {
    if (value === null || value === undefined || value === "") return null;
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? Math.round(n) : null;
  }, schema.nullable());
}

export const gymBranchFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Branch name is required")
    .max(120, "Branch name must be 120 characters or less"),
  slug: z
    .string()
    .optional()
    .nullable()
    .transform((value) => value?.trim() ?? "")
    .pipe(z.string().max(80)),
  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .max(300, "Address must be 300 characters or less"),
  area: z
    .string()
    .trim()
    .min(1, "Area is required")
    .max(80, "Area must be 80 characters or less"),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(80, "City must be 80 characters or less"),
  latitude: optionalCoord(-90, 90, "Latitude"),
  longitude: optionalCoord(-180, 180, "Longitude"),
  phone: optionalContact,
  whatsappNumber: optionalContact,
  email: z
    .string()
    .optional()
    .nullable()
    .transform(emptyToNull)
    .superRefine((value, ctx) => {
      if (!value) return;
      const parsed = z.string().email().safeParse(value);
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid email address",
        });
      }
    })
    .pipe(z.string().max(120).nullable()),
  openingHours: z
    .string()
    .optional()
    .nullable()
    .transform(emptyToNull)
    .pipe(z.string().max(200).nullable()),
  ladiesHours: z
    .string()
    .optional()
    .nullable()
    .transform(emptyToNull)
    .pipe(z.string().max(200).nullable()),
  status: z.enum(GYM_BRANCH_STATUSES).default("ACTIVE"),
  isPrimary: z.boolean().optional().default(false),
  description: z
    .string()
    .optional()
    .nullable()
    .transform(emptyToNull)
    .pipe(z.string().max(5000).nullable()),
  priceMin: optionalNullableInt(0),
  priceMax: optionalNullableInt(0),
  ladiesStatus: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.enum(["mixed", "ladies_only", "ladies_timings", "men_only"]).nullable()
  ),
  sizeCategory: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.enum(["small", "medium", "large"]).nullable()
  ),
  equipment: z
    .string()
    .optional()
    .nullable()
    .transform(emptyToNull)
    .pipe(z.string().max(5000).nullable()),
  transformations: z
    .string()
    .optional()
    .nullable()
    .transform(emptyToNull)
    .pipe(z.string().max(5000).nullable()),
  establishedYear: optionalNullableInt(1950, new Date().getFullYear()),
  memberCount: optionalNullableInt(0),
  coachInfo: z
    .string()
    .optional()
    .nullable()
    .transform(emptyToNull)
    .pipe(z.string().max(5000).nullable()),
  useCommonAmenities: z.boolean().optional().default(true),
  useCommonDisciplines: z.boolean().optional().default(true),
  useCommonHours: z.boolean().optional().default(true),
  disciplines: z.array(z.string()).optional().default([]),
  customDisciplines: z.array(z.string()).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  customAmenities: z.array(z.string()).optional().default([]),
  coverImage: z
    .object({
      imageUrl: z.string().min(1),
      publicId: z.string().optional().nullable(),
    })
    .nullable()
    .optional(),
  galleryImages: z
    .array(
      z.object({
        id: z.string().optional(),
        imageUrl: z.string().min(1),
        publicId: z.string().optional().nullable(),
        alt: z.string().optional().nullable(),
      })
    )
    .optional()
    .default([]),
});

export type GymBranchFormInput = z.input<typeof gymBranchFormSchema>;
export type GymBranchFormValues = z.output<typeof gymBranchFormSchema>;

export const gymBranchStatusSchema = z.object({
  status: z.enum(GYM_BRANCH_STATUSES),
});

export function flattenGymBranchZodErrors(
  error: z.ZodError
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

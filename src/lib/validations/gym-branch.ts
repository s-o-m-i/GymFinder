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

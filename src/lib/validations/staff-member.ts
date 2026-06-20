import { z } from "zod";
import {
  STAFF_BIO_MAX_CHARS,
  STAFF_BIO_MAX_WORDS,
  STAFF_LIST_ITEM_MAX_CHARS,
  STAFF_LIST_ITEM_MAX_WORDS,
  STAFF_LIST_MAX_ITEMS,
  countListItemWords,
  countStaffBioWords,
} from "@/lib/staff-members";

function emptyToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function optionalUrlField(label: string) {
  return z
    .string()
    .optional()
    .nullable()
    .transform(emptyToNull)
    .superRefine((val, ctx) => {
      if (!val) return;
      try {
        new URL(val);
      } catch {
        ctx.addIssue({
          code: "custom",
          message: `${label} must be a valid URL`,
        });
      }
    });
}

function listItemNameSchema(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} name is required`)
    .max(
      STAFF_LIST_ITEM_MAX_CHARS,
      `${label} must be ${STAFF_LIST_ITEM_MAX_CHARS} characters or less`
    )
    .superRefine((val, ctx) => {
      const words = countListItemWords(val);
      if (words > STAFF_LIST_ITEM_MAX_WORDS) {
        ctx.addIssue({
          code: "custom",
          message: `${label} must be ${STAFF_LIST_ITEM_MAX_WORDS} words or less`,
        });
      }
    });
}

const certificationItemSchema = z.object({
  id: z.string().min(1),
  name: listItemNameSchema("Certification"),
  imageUrl: z
    .union([z.string().url(), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v && v !== "" ? v : null)),
  cloudinaryId: z
    .union([z.string().max(500), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v && v !== "" ? v : null)),
});

const achievementItemSchema = z.object({
  id: z.string().min(1),
  name: listItemNameSchema("Achievement"),
});

const certificationsFieldSchema = z
  .array(certificationItemSchema)
  .max(STAFF_LIST_MAX_ITEMS, `Maximum ${STAFF_LIST_MAX_ITEMS} certifications allowed`)
  .optional()
  .default([])
  .transform((items) => (items.length > 0 ? JSON.stringify(items) : null));

const achievementsFieldSchema = z
  .array(achievementItemSchema)
  .max(STAFF_LIST_MAX_ITEMS, `Maximum ${STAFF_LIST_MAX_ITEMS} achievements allowed`)
  .optional()
  .default([])
  .transform((items) => (items.length > 0 ? JSON.stringify(items) : null));

export const staffMemberFormSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(120, "Name must be 120 characters or less"),
  designation: z
    .string()
    .min(1, "Designation is required")
    .max(120, "Designation must be 120 characters or less"),
  bio: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? "")
    .pipe(
      z
        .string()
        .max(
          STAFF_BIO_MAX_CHARS,
          `Bio must be ${STAFF_BIO_MAX_CHARS} characters or less`
        )
        .superRefine((val, ctx) => {
          if (!val.trim()) return;
          const words = countStaffBioWords(val);
          if (words > STAFF_BIO_MAX_WORDS) {
            ctx.addIssue({
              code: "custom",
              message: `Bio must be ${STAFF_BIO_MAX_WORDS} words or less (currently ${words})`,
            });
          }
        })
        .transform(emptyToNull)
    ),
  yearsExperience: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? Math.round(n) : null;
    })
    .pipe(
      z
        .number()
        .int("Experience must be a whole number")
        .min(0, "Experience cannot be negative")
        .max(80, "Experience seems too high")
        .nullable()
    ),
  specialization: z
    .string()
    .optional()
    .nullable()
    .transform(emptyToNull)
    .pipe(z.string().max(200).nullable()),
  certifications: certificationsFieldSchema,
  achievements: achievementsFieldSchema,
  profileImage: z
    .union([z.string().url("Invalid image URL"), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v && v !== "" ? v : null)),
  cloudinaryId: z
    .union([z.string().max(500), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v && v !== "" ? v : null)),
  instagramUrl: optionalUrlField("Instagram URL"),
  facebookUrl: optionalUrlField("Facebook URL"),
  linkedinUrl: optionalUrlField("LinkedIn URL"),
  isCoach: z.boolean(),
  isActive: z.boolean(),
});

export type StaffMemberFormInput = z.input<typeof staffMemberFormSchema>;
export type StaffMemberFormValues = z.output<typeof staffMemberFormSchema>;

export const reorderStaffSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1, "At least one member is required"),
});

export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

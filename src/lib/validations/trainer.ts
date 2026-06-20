import { z } from "zod";
import { CITIES } from "@/lib/constants";
import { TRAINER_SPECIALIZATIONS } from "@/lib/trainer-constants";
import {
  STAFF_LIST_ITEM_MAX_CHARS,
  STAFF_LIST_ITEM_MAX_WORDS,
  STAFF_LIST_MAX_ITEMS,
  countListItemWords,
} from "@/lib/staff-members";
import {
  TRAINER_AVAILABILITY_MAX_SLOTS,
} from "@/lib/trainer-availability";
import { WEEKDAYS } from "@/lib/opening-hours";

const specializationValues = TRAINER_SPECIALIZATIONS.map((s) => s.value);
const weekdayValues = WEEKDAYS.map((d) => d.value);

function listItemNameSchema(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} name is required`)
    .max(STAFF_LIST_ITEM_MAX_CHARS, `${label} must be ${STAFF_LIST_ITEM_MAX_CHARS} characters or less`)
    .superRefine((val, ctx) => {
      if (countListItemWords(val) > STAFF_LIST_ITEM_MAX_WORDS) {
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

const availabilitySlotSchema = z.object({
  id: z.string().min(1),
  days: z
    .array(z.enum(weekdayValues as [string, ...string[]]))
    .min(1, "Each slot needs at least one day"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid start time"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid end time"),
});

export const trainerOtpSendSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const trainerOtpVerifySchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .length(6, "Enter the 6-digit code.")
    .regex(/^\d{6}$/, "Code must be 6 digits."),
});

export const trainerProfileSchema = z.object({
  fullName: z.string().min(2, "Name is required.").max(120),
  headline: z.string().max(200).optional().nullable(),
  bio: z.string().max(5000).optional().nullable(),
  city: z.enum(CITIES as unknown as [string, ...string[]]),
  area: z.string().max(100).optional().nullable(),
  specialization: z.enum(specializationValues as [string, ...string[]]).optional().nullable(),
  experienceYears: z.coerce.number().int().min(0).max(60).optional().nullable(),
  certifications: z
    .array(certificationItemSchema)
    .max(STAFF_LIST_MAX_ITEMS, `Maximum ${STAFF_LIST_MAX_ITEMS} certifications allowed`)
    .optional()
    .default([]),
  achievements: z
    .array(achievementItemSchema)
    .max(STAFF_LIST_MAX_ITEMS, `Maximum ${STAFF_LIST_MAX_ITEMS} achievements allowed`)
    .optional()
    .default([]),
  availabilitySlots: z
    .array(availabilitySlotSchema)
    .max(
      TRAINER_AVAILABILITY_MAX_SLOTS,
      `Maximum ${TRAINER_AVAILABILITY_MAX_SLOTS} availability slots allowed`
    )
    .optional()
    .default([]),
  hourlyRate: z.coerce.number().int().min(0).max(500000).optional().nullable(),
  whatsappNumber: z.string().min(10, "WhatsApp number is required.").max(20),
  email: z.string().email().optional().nullable().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  gymId: z.string().cuid().optional().nullable().or(z.literal("")),
  profileImage: z
    .union([z.string().url(), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v && v !== "" ? v : null)),
  cloudinaryId: z
    .union([z.string().max(500), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v && v !== "" ? v : null)),
  isPublished: z.boolean().optional(),
});

export type TrainerProfileInput = z.infer<typeof trainerProfileSchema>;

export const trainerListingFiltersSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.enum(["beginner", "intermediate", "experienced", "expert"]).optional(),
  rate: z.enum(["under_2000", "2000_5000", "5000_10000", "over_10000"]).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  rating: z.enum(["4_5", "4", "3_5", "3"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
  verified: z.enum(["true", "false"]).optional(),
  sort: z.enum(["featured", "rating", "experience", "rate_asc", "rate_desc", "newest"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(48).optional(),
});

export type TrainerListingFilters = z.infer<typeof trainerListingFiltersSchema>;

import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^https?:\/\/.+/i.test(v), "Enter a valid URL starting with http:// or https://");

export const gymClaimPositionSchema = z.enum([
  "OWNER",
  "MANAGER",
  "PARTNER",
  "MARKETING_MANAGER",
  "OTHER",
]);

export const gymClaimSubmitSchema = z.object({
  gymId: z.string().min(1),
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid business email").max(160),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[\d\s+\-()]+$/, "Enter a valid phone number"),
  whatsapp: z
    .string()
    .trim()
    .min(7, "Enter a valid WhatsApp number")
    .max(20)
    .regex(/^[\d\s+\-()]+$/, "Enter a valid WhatsApp number"),
  position: gymClaimPositionSchema,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  message: z.string().trim().max(2000).optional(),
  authorized: z.boolean().refine((v) => v === true, {
    message: "You must confirm you are authorized to manage this gym.",
  }),
});

export type GymClaimSubmitInput = z.infer<typeof gymClaimSubmitSchema>;

export const gymClaimRejectSchema = z.object({
  rejectionReason: z.string().trim().max(1000).optional(),
  adminNotes: z.string().trim().max(2000).optional(),
});

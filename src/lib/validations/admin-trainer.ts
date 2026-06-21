import { z } from "zod";
import { trainerProfileSchema } from "@/lib/validations/trainer";

export const adminTrainerSchema = trainerProfileSchema.extend({
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export type AdminTrainerInput = z.infer<typeof adminTrainerSchema>;

export const adminTrainerStatusSchema = z.object({
  isPublished: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export type AdminTrainerStatusInput = z.infer<typeof adminTrainerStatusSchema>;

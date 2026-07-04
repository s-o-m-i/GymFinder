import { z } from "zod";
import {
  HeightUnit,
  SuccessStoryGender,
  SuccessStoryGoal,
  WeightUnit,
} from "@prisma/client";

const progressImageSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().url(),
  cloudinaryId: z.string().nullable().optional(),
  caption: z.string().max(120).nullable().optional(),
});

export const successStoryBasicStepSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  clientName: z.string().trim().min(2, "Client name is required").max(80),
  gender: z.nativeEnum(SuccessStoryGender, { message: "Gender is required" }),
  city: z.string().trim().min(2, "City is required"),
  goal: z.nativeEnum(SuccessStoryGoal),
  duration: z.string().trim().min(2, "Duration is required").max(60),
  coverImageUrl: z.string().url().optional().nullable(),
  coverCloudinaryId: z.string().optional().nullable(),
});

export const successStoryTransformationStepSchema = z.object({
  beforeImageUrl: z.string().url("Before photo is required"),
  beforeCloudinaryId: z.string().optional().nullable(),
  afterImageUrl: z.string().url("After photo is required"),
  afterCloudinaryId: z.string().optional().nullable(),
  progressImages: z.array(progressImageSchema).max(12).default([]),
  startWeight: z.number().positive().optional().nullable(),
  currentWeight: z.number().positive().optional().nullable(),
  height: z.number().positive().optional().nullable(),
  weightUnit: z.nativeEnum(WeightUnit).default(WeightUnit.KG),
  heightUnit: z.nativeEnum(HeightUnit).default(HeightUnit.CM),
});

export const successStoryJourneyStepSchema = z.object({
  story: z
    .string()
    .trim()
    .min(300, "Story must be at least 300 characters")
    .max(3000, "Story must be under 3000 characters"),
});

export const successStoryConnectStepSchema = z.object({
  linkedGymId: z.string().cuid().optional().nullable().or(z.literal("")),
  linkedTrainerId: z.string().cuid().optional().nullable().or(z.literal("")),
});

export const successStoryFormSchema = successStoryBasicStepSchema
  .merge(successStoryTransformationStepSchema)
  .merge(successStoryJourneyStepSchema)
  .merge(successStoryConnectStepSchema)
  .extend({
    seoTitle: z.string().max(120).optional().nullable(),
    seoDescription: z.string().max(160).optional().nullable(),
    ogImageUrl: z.string().url().optional().nullable(),
  });

export const successStoryListingQuerySchema = z.object({
  q: z.string().trim().optional(),
  publisherType: z.enum(["GYM", "TRAINER", "USER"]).optional(),
  goal: z.nativeEnum(SuccessStoryGoal).optional(),
  gender: z.nativeEnum(SuccessStoryGender).optional(),
  city: z.string().trim().optional(),
  verified: z.enum(["1", "true"]).optional(),
  featured: z.enum(["1", "true"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type SuccessStoryFormValues = z.infer<typeof successStoryFormSchema>;
export type SuccessStoryListingQuery = z.infer<typeof successStoryListingQuerySchema>;

import { z } from "zod";
import {
  TRANSFORMATION_CLIENT_NAME_MAX_CHARS,
  TRANSFORMATION_MAX_ITEMS,
  TRANSFORMATION_STORY_MAX_CHARS,
  TRANSFORMATION_STORY_MAX_WORDS,
  countTransformationWords,
} from "@/lib/transformations";

const transformationItemSchema = z.object({
  id: z.string().min(1),
  clientName: z
    .string()
    .max(
      TRANSFORMATION_CLIENT_NAME_MAX_CHARS,
      `Client name must be ${TRANSFORMATION_CLIENT_NAME_MAX_CHARS} characters or less`
    )
    .nullish()
    .transform((v) => (v?.trim() ? v.trim() : null)),
  story: z
    .string()
    .trim()
    .min(1, "Client story is required")
    .max(
      TRANSFORMATION_STORY_MAX_CHARS,
      `Story must be ${TRANSFORMATION_STORY_MAX_CHARS} characters or less`
    )
    .superRefine((val, ctx) => {
      if (countTransformationWords(val) > TRANSFORMATION_STORY_MAX_WORDS) {
        ctx.addIssue({
          code: "custom",
          message: `Story must be ${TRANSFORMATION_STORY_MAX_WORDS} words or less`,
        });
      }
    }),
  beforeImageUrl: z.string().url("Before photo is required"),
  beforeCloudinaryId: z.string().nullish(),
  afterImageUrl: z.string().url("After photo is required"),
  afterCloudinaryId: z.string().nullish(),
});

export const transformationsSchema = z
  .array(transformationItemSchema)
  .max(
    TRANSFORMATION_MAX_ITEMS,
    `Maximum ${TRANSFORMATION_MAX_ITEMS} transformations allowed`
  );

export function flattenTransformationZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

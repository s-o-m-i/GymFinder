import { z } from "zod";

export const featuredPlanFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(40)
    .regex(/^[a-z0-9_-]+$/, "Use lowercase letters, numbers, hyphens"),
  name: z.string().trim().min(3, "Name is required").max(120),
  durationDays: z.coerce.number().int().min(1).max(365),
  amount: z.coerce.number().int().min(1).max(10_000_000),
  benefits: z.array(z.string().trim().min(1).max(200)).min(1, "Add at least one benefit"),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export type FeaturedPlanFormInput = z.infer<typeof featuredPlanFormSchema>;

export function flattenFeaturedPlanErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

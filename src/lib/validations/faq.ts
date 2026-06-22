import { z } from "zod";

export const FAQ_QUESTION_MAX = 200;
export const FAQ_ANSWER_MAX = 2000;
export const FAQ_MAX_ITEMS = 30;

export const faqFormSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(FAQ_QUESTION_MAX, `Question must be ${FAQ_QUESTION_MAX} characters or less`),
  answer: z
    .string()
    .trim()
    .min(1, "Answer is required")
    .max(FAQ_ANSWER_MAX, `Answer must be ${FAQ_ANSWER_MAX} characters or less`),
  isActive: z.boolean().default(true),
});

export type FaqFormInput = z.infer<typeof faqFormSchema>;

export const reorderFaqsSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export const faqsEnabledSchema = z.object({
  enabled: z.boolean(),
});

export function flattenFaqZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
};

import { z } from "zod";

export const PAYMENT_METHODS = ["jazzcash", "easypaisa"] as const;

export const featureRequestSubmitSchema = z.object({
  planId: z.string().min(1, "Select a plan"),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    message: "Select a payment method",
  }),
  transactionId: z
    .string()
    .trim()
    .min(4, "Transaction ID is required")
    .max(64, "Transaction ID is too long"),
  screenshotUrl: z.string().url("Upload a payment screenshot"),
  screenshotPublicId: z.string().min(1, "Upload a payment screenshot"),
  notes: z.string().trim().max(500).optional(),
});

export type FeatureRequestSubmitInput = z.infer<typeof featureRequestSubmitSchema>;

export function flattenFeatureRequestErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

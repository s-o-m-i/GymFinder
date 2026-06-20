import { z } from "zod";

export const ownerEmailSchema = z.string().trim().email().transform((v) => v.toLowerCase());

export const ownerForgotPasswordSchema = z.object({
  email: ownerEmailSchema,
});

export const ownerResendVerificationSchema = z.object({
  email: ownerEmailSchema,
});

export const ownerResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

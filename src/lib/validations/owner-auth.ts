import { z } from "zod";

export const ownerEmailSchema = z.string().trim().email().transform((v) => v.toLowerCase());

export const ownerForgotPasswordSchema = z.object({
  email: ownerEmailSchema,
});

export const ownerResendVerificationSchema = z.object({
  email: ownerEmailSchema,
});

export const ownerOtpVerifySchema = z.object({
  email: ownerEmailSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export const ownerResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

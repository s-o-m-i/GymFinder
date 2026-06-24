import { z } from "zod";

export const trainerEmailSchema = z
  .string()
  .trim()
  .email()
  .transform((v) => v.toLowerCase());

export const trainerRegisterSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(120),
  email: trainerEmailSchema,
  phone: z.string().trim().min(10, "Enter a valid phone number.").max(20),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const trainerLoginSchema = z.object({
  email: trainerEmailSchema,
  password: z.string().min(1, "Password is required."),
});

export const trainerResendVerificationSchema = z.object({
  email: trainerEmailSchema,
});

export const trainerOtpVerifySchema = z.object({
  email: trainerEmailSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export const trainerForgotPasswordSchema = z.object({
  email: trainerEmailSchema,
});

export const trainerResetPasswordSchema = z
  .object({
    email: trainerEmailSchema,
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

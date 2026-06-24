import "server-only";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  createTrainerVerificationOtp,
  verifyTrainerVerificationOtp,
  createTrainerPasswordResetOtp,
  verifyTrainerPasswordResetOtp,
} from "@/lib/trainer-auth-tokens";
import {
  sendTrainerVerificationOtpEmail,
  sendTrainerPasswordResetOtpEmail,
} from "@/services/trainer/trainer-email.service";
import {
  isDevEmailLinksEnabled,
  isResendRecipientRestrictionError,
  logDevEmailLink,
} from "@/lib/email-dev";

export async function registerTrainerAccount(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await prisma.trainerAccount.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    if (!existing.emailVerified) {
      return {
        ok: false as const,
        status: 409 as const,
        error: "An account with this email already exists but is not verified.",
        requiresVerification: true,
        email: normalizedEmail,
      };
    }
    return {
      ok: false as const,
      status: 409 as const,
      error: "An account with this email already exists. Sign in instead.",
    };
  }

  const passwordHash = await hashPassword(input.password);
  const account = await prisma.trainerAccount.create({
    data: {
      email: normalizedEmail,
      name: input.name.trim(),
      phone: input.phone.trim(),
      passwordHash,
      emailVerified: false,
    },
  });

  const otpCode = await createTrainerVerificationOtp(account.id);
  logDevEmailLink("Trainer verification OTP", `Code: ${otpCode} for ${account.email}`);

  try {
    await sendTrainerVerificationOtpEmail({
      to: account.email,
      name: account.name ?? "Trainer",
      code: otpCode,
    });
  } catch (emailError) {
    const message = emailError instanceof Error ? emailError.message : "Email send failed";

    if (isDevEmailLinksEnabled() && isResendRecipientRestrictionError(message)) {
      return {
        ok: true as const,
        email: account.email,
        devOtpCode: otpCode,
      };
    }

    await prisma.trainerAccount.delete({ where: { id: account.id } });
    throw emailError;
  }

  return { ok: true as const, email: account.email };
}

export async function loginTrainerWithPassword(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const account = await prisma.trainerAccount.findUnique({
    where: { email: normalized },
    include: { trainer: { select: { id: true } } },
  });

  if (!account || !account.passwordHash) {
    await new Promise((r) => setTimeout(r, 500));
    return { ok: false as const, status: 401 as const, error: "Invalid email or password." };
  }

  if (!(await verifyPassword(password, account.passwordHash))) {
    await new Promise((r) => setTimeout(r, 500));
    return { ok: false as const, status: 401 as const, error: "Invalid email or password." };
  }

  if (!account.emailVerified) {
    return {
      ok: false as const,
      status: 403 as const,
      error: "Please verify your email before signing in.",
      requiresVerification: true,
      email: account.email,
    };
  }

  return {
    ok: true as const,
    accountId: account.id,
    email: account.email,
    trainerId: account.trainer?.id ?? null,
  };
}

export async function resendTrainerVerificationOtp(email: string) {
  const normalized = email.trim().toLowerCase();
  const account = await prisma.trainerAccount.findUnique({
    where: { email: normalized },
  });

  if (!account) {
    return {
      ok: true as const,
      message: "If an unverified account exists, a verification code has been sent.",
    };
  }

  if (account.emailVerified) {
    return {
      ok: false as const,
      status: 400 as const,
      error: "This email is already verified. You can sign in.",
    };
  }

  const otpCode = await createTrainerVerificationOtp(account.id);
  logDevEmailLink("Trainer verification OTP", `Code: ${otpCode} for ${account.email}`);

  try {
    await sendTrainerVerificationOtpEmail({
      to: account.email,
      name: account.name ?? "Trainer",
      code: otpCode,
    });
  } catch (emailError) {
    const message = emailError instanceof Error ? emailError.message : "Email send failed";

    if (isDevEmailLinksEnabled() && isResendRecipientRestrictionError(message)) {
      return {
        ok: true as const,
        message: "Resend test mode: use the verification code below.",
        devOtpCode: otpCode,
      };
    }

    throw emailError;
  }

  return { ok: true as const, message: "Verification code sent. Check your inbox." };
}

export async function verifyTrainerEmailOtp(email: string, code: string) {
  const account = await verifyTrainerVerificationOtp(email, code);
  if (!account) {
    return { ok: false as const, error: "Invalid or expired code. Request a new one and try again." };
  }

  if (!account.emailVerified) {
    await prisma.trainerAccount.update({
      where: { id: account.id },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });
  }

  return {
    ok: true as const,
    accountId: account.id,
    email: account.email,
    trainerId: account.trainer?.id ?? null,
  };
}

const PASSWORD_RESET_GENERIC =
  "If a verified account exists for that email, a reset code has been sent.";

export async function requestTrainerPasswordResetOtp(email: string) {
  const normalized = email.trim().toLowerCase();
  const account = await prisma.trainerAccount.findUnique({
    where: { email: normalized },
  });

  if (account?.emailVerified) {
    const otpCode = await createTrainerPasswordResetOtp(account.id);
    logDevEmailLink("Trainer password reset OTP", `Code: ${otpCode} for ${account.email}`);

    try {
      await sendTrainerPasswordResetOtpEmail({
        to: account.email,
        name: account.name ?? "Trainer",
        code: otpCode,
      });
    } catch (emailError) {
      const message = emailError instanceof Error ? emailError.message : "Email send failed";

      if (isDevEmailLinksEnabled() && isResendRecipientRestrictionError(message)) {
        return {
          ok: true as const,
          message: "Resend test mode: use the reset code below.",
          email: account.email,
          devOtpCode: otpCode,
        };
      }

      throw emailError;
    }
  }

  return {
    ok: true as const,
    message: PASSWORD_RESET_GENERIC,
    email: account?.emailVerified ? normalized : undefined,
  };
}

export async function resetTrainerPasswordWithOtp(
  email: string,
  code: string,
  password: string
) {
  const account = await verifyTrainerPasswordResetOtp(email, code);
  if (!account) {
    return {
      ok: false as const,
      status: 400 as const,
      error: "Invalid or expired code. Request a new one and try again.",
    };
  }

  if (!account.emailVerified) {
    return {
      ok: false as const,
      status: 403 as const,
      error: "Please verify your email before resetting your password.",
    };
  }

  const passwordHash = await hashPassword(password);
  await prisma.trainerAccount.update({
    where: { id: account.id },
    data: { passwordHash },
  });

  return {
    ok: true as const,
    message: "Password updated. You can now sign in.",
  };
}

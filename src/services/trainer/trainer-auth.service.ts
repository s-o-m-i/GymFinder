import "server-only";

import { prisma } from "@/lib/prisma";
import {
  createTrainerOtp,
  verifyTrainerOtp,
} from "@/lib/trainer-auth-tokens";
import { sendTrainerOtpEmail } from "@/services/trainer/trainer-email.service";
import {
  isDevEmailLinksEnabled,
  isResendRecipientRestrictionError,
  logDevEmailLink,
} from "@/lib/email-dev";

export async function findOrCreateTrainerAccount(email: string) {
  const normalized = email.trim().toLowerCase();
  return prisma.trainerAccount.upsert({
    where: { email: normalized },
    create: { email: normalized },
    update: {},
    include: { trainer: { select: { id: true } } },
  });
}

export async function sendTrainerLoginOtp(email: string) {
  const account = await findOrCreateTrainerAccount(email);
  const code = await createTrainerOtp(account.id);

  try {
    await sendTrainerOtpEmail({ to: account.email, code });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email send failed";

    if (isDevEmailLinksEnabled() && isResendRecipientRestrictionError(message)) {
      logDevEmailLink("Trainer OTP (dev)", `Code: ${code} for ${account.email}`);
      return {
        success: true as const,
        email: account.email,
        devOtpCode: code,
        isNewAccount: !account.trainer,
      };
    }

    throw error;
  }

  if (isDevEmailLinksEnabled()) {
    logDevEmailLink("Trainer OTP (dev)", `Code: ${code} for ${account.email}`);
  }

  return {
    success: true as const,
    email: account.email,
    isNewAccount: !account.trainer,
  };
}

export async function verifyTrainerLoginOtp(email: string, code: string) {
  const normalized = email.trim().toLowerCase();
  const account = await prisma.trainerAccount.findUnique({
    where: { email: normalized },
    include: { trainer: { select: { id: true } } },
  });

  if (!account) {
    return { success: false as const, error: "No login code found. Request a new one." };
  }

  const valid = await verifyTrainerOtp(account.id, code);
  if (!valid) {
    return { success: false as const, error: "Invalid or expired code. Try again." };
  }

  if (!account.emailVerified) {
    await prisma.trainerAccount.update({
      where: { id: account.id },
      data: { emailVerified: true },
    });
  }

  return {
    success: true as const,
    accountId: account.id,
    email: account.email,
    trainerId: account.trainer?.id ?? null,
  };
}

/** Future: wire to shared analytics pipeline */
export async function trackTrainerLead(_input: {
  trainerId: string;
  eventType: "WHATSAPP_CLICK" | "PHONE_CLICK" | "CONTACT_CLICK" | "PROFILE_VIEW";
  sessionId?: string;
}) {
  // Intentionally no-op until lead analytics is enabled platform-wide.
}

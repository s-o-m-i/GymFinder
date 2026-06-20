import "server-only";

import { createHash, randomInt } from "crypto";
import type { TrainerAuthTokenType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const OTP_TTL_MINUTES = 10;

function getTokenSecret() {
  return process.env.JWT_SECRET ?? "gymxclubs-token-secret";
}

export function hashTrainerAuthToken(raw: string): string {
  return createHash("sha256")
    .update(`${getTokenSecret()}:trainer:${raw}`)
    .digest("hex");
}

export function generateOtpCode(): string {
  return String(randomInt(100000, 999999));
}

export async function createTrainerOtp(accountId: string): Promise<string> {
  const code = generateOtpCode();
  const tokenHash = hashTrainerAuthToken(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.$transaction([
    prisma.trainerAuthToken.updateMany({
      where: { accountId, type: "EMAIL_OTP", usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.trainerAuthToken.create({
      data: {
        accountId,
        tokenHash,
        type: "EMAIL_OTP",
        expiresAt,
      },
    }),
  ]);

  return code;
}

export async function verifyTrainerOtp(accountId: string, code: string): Promise<boolean> {
  const tokenHash = hashTrainerAuthToken(code.trim());
  const now = new Date();

  const record = await prisma.trainerAuthToken.findFirst({
    where: {
      accountId,
      tokenHash,
      type: "EMAIL_OTP",
      usedAt: null,
      expiresAt: { gt: now },
    },
  });

  if (!record) return false;

  await prisma.trainerAuthToken.update({
    where: { id: record.id },
    data: { usedAt: now },
  });

  return true;
}

export async function invalidateTrainerTokens(
  accountId: string,
  type: TrainerAuthTokenType
) {
  await prisma.trainerAuthToken.updateMany({
    where: { accountId, type, usedAt: null },
    data: { usedAt: new Date() },
  });
}

import "server-only";

import { createHash, randomBytes, randomInt } from "crypto";
import type { OwnerAuthTokenType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const TOKEN_BYTES = 32;
const OWNER_OTP_TTL_MINUTES = 10;

function getTokenSecret() {
  return process.env.JWT_SECRET ?? "gymxclubs-token-secret";
}

export function hashAuthToken(rawToken: string): string {
  return createHash("sha256")
    .update(`${getTokenSecret()}:${rawToken}`)
    .digest("hex");
}

export function generateAuthToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export function generateOwnerOtpCode(): string {
  return String(randomInt(100000, 999999));
}

const TOKEN_TTL_HOURS: Record<OwnerAuthTokenType, number> = {
  EMAIL_VERIFICATION: 24,
  PASSWORD_RESET: 1,
};

export async function createOwnerEmailOtp(ownerId: string): Promise<string> {
  const code = generateOwnerOtpCode();
  const tokenHash = hashAuthToken(code);
  const expiresAt = new Date(Date.now() + OWNER_OTP_TTL_MINUTES * 60 * 1000);

  await prisma.$transaction([
    prisma.ownerAuthToken.updateMany({
      where: { ownerId, type: "EMAIL_VERIFICATION", usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.ownerAuthToken.create({
      data: { ownerId, tokenHash, type: "EMAIL_VERIFICATION", expiresAt },
    }),
  ]);

  return code;
}

export async function verifyOwnerEmailOtp(email: string, code: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const owner = await prisma.gymOwner.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      businessCategory: true,
    },
  });

  if (!owner) return null;

  const tokenHash = hashAuthToken(code.trim());
  const now = new Date();

  const record = await prisma.ownerAuthToken.findFirst({
    where: {
      ownerId: owner.id,
      tokenHash,
      type: "EMAIL_VERIFICATION",
      usedAt: null,
      expiresAt: { gt: now },
    },
  });

  if (!record) return null;

  await prisma.ownerAuthToken.update({
    where: { id: record.id },
    data: { usedAt: now },
  });

  return owner;
}

export async function createOwnerAuthToken(
  ownerId: string,
  type: OwnerAuthTokenType
): Promise<string> {
  const rawToken = generateAuthToken();
  const tokenHash = hashAuthToken(rawToken);
  const expiresAt = new Date(
    Date.now() + TOKEN_TTL_HOURS[type] * 60 * 60 * 1000
  );

  await prisma.$transaction([
    prisma.ownerAuthToken.updateMany({
      where: { ownerId, type, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.ownerAuthToken.create({
      data: { ownerId, tokenHash, type, expiresAt },
    }),
  ]);

  return rawToken;
}

export async function consumeOwnerAuthToken(
  rawToken: string,
  type: OwnerAuthTokenType
) {
  const tokenHash = hashAuthToken(rawToken);
  const now = new Date();

  const record = await prisma.ownerAuthToken.findUnique({
    where: { tokenHash },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          businessCategory: true,
        },
      },
    },
  });

  if (
    !record ||
    record.type !== type ||
    record.usedAt ||
    record.expiresAt < now
  ) {
    return null;
  }

  await prisma.ownerAuthToken.update({
    where: { id: record.id },
    data: { usedAt: now },
  });

  return record.owner;
}

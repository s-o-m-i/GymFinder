import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { BusinessCategory } from "@prisma/client";

export const OWNER_COOKIE_NAME = "owner_session";
export const OWNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface OwnerSession {
  ownerId:          string;
  email:            string;
  businessCategory: BusinessCategory;
}

function getSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw) throw new Error("JWT_SECRET environment variable is not set");
  return new TextEncoder().encode(raw);
}

export async function signOwnerToken(session: OwnerSession): Promise<string> {
  return new SignJWT({
    owner:            true,
    ownerId:          session.ownerId,
    email:            session.email,
    businessCategory: session.businessCategory,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${OWNER_COOKIE_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyOwnerToken(token: string): Promise<OwnerSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.owner !== true || typeof payload.ownerId !== "string") return null;
    return {
      ownerId:          payload.ownerId,
      email:            String(payload.email ?? ""),
      businessCategory: payload.businessCategory as BusinessCategory,
    };
  } catch {
    return null;
  }
}

export async function getOwnerSession(): Promise<OwnerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(OWNER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyOwnerToken(token);
}

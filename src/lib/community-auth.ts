import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const COMMUNITY_COOKIE_NAME = "community_session";
export const COMMUNITY_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export interface CommunitySession {
  userId: string;
  email: string;
  fullName: string;
}

function getSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw) throw new Error("JWT_SECRET environment variable is not set");
  return new TextEncoder().encode(raw);
}

export async function signCommunityToken(session: CommunitySession): Promise<string> {
  return new SignJWT({
    community: true,
    userId: session.userId,
    email: session.email,
    fullName: session.fullName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COMMUNITY_COOKIE_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyCommunityToken(token: string): Promise<CommunitySession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.community !== true || typeof payload.userId !== "string") return null;
    return {
      userId: payload.userId,
      email: String(payload.email ?? ""),
      fullName: String(payload.fullName ?? ""),
    };
  } catch {
    return null;
  }
}

export async function getCommunitySession(): Promise<CommunitySession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COMMUNITY_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCommunityToken(token);
}

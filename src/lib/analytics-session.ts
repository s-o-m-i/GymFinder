import "server-only";

import { createHash, randomUUID } from "crypto";
import { cookies, headers } from "next/headers";
import {
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_SESSION_HEADER,
  ANALYTICS_SESSION_MAX_AGE,
} from "@/lib/analytics-constants";

export {
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_SESSION_HEADER,
  ANALYTICS_SESSION_MAX_AGE,
} from "@/lib/analytics-constants";

export interface AnalyticsVisitorContext {
  sessionId: string;
  sessionHash: string;
  ipHash: string | null;
  userAgent: string | null;
}

function getHashSecret() {
  return (
    process.env.ANALYTICS_HASH_SECRET ??
    process.env.JWT_SECRET ??
    "gymxclubs-analytics-dev-secret"
  );
}

export function hashAnalyticsValue(value: string): string {
  return createHash("sha256")
    .update(`${getHashSecret()}:${value}`)
    .digest("hex");
}

export function buildVisitorHash(sessionId: string, gymId: string): string {
  return hashAnalyticsValue(`${sessionId}:${gymId}`);
}

export function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent?.trim()) return true;
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|bytespider|bingpreview|yandex/i.test(
    userAgent
  );
}

function getClientIp(headerStore: Headers): string | null {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return headerStore.get("x-real-ip");
}

export async function ensureAnalyticsSession(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(ANALYTICS_SESSION_COOKIE)?.value;
  if (existing) return existing;

  const headerStore = await headers();
  const fromHeader = headerStore.get(ANALYTICS_SESSION_HEADER);
  if (fromHeader) return fromHeader;

  // Cookie is set in proxy for page requests; route handlers may still create one.
  const sessionId = randomUUID();
  try {
    cookieStore.set(ANALYTICS_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ANALYTICS_SESSION_MAX_AGE,
      path: "/",
    });
  } catch {
    // Server Components cannot mutate cookies — proxy should have set it already
  }

  return sessionId;
}

export async function getAnalyticsVisitorContext(
  gymId: string
): Promise<AnalyticsVisitorContext> {
  const sessionId = await ensureAnalyticsSession();
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent");
  const ip = getClientIp(headerStore);

  return {
    sessionId,
    sessionHash: hashAnalyticsValue(sessionId),
    ipHash: ip ? hashAnalyticsValue(ip) : null,
    userAgent,
  };
}

/** For API routes that receive session id from cookie directly */
export function getAnalyticsVisitorContextFromRequest(
  sessionId: string,
  gymId: string,
  userAgent: string | null,
  ip: string | null
): AnalyticsVisitorContext {
  return {
    sessionId,
    sessionHash: hashAnalyticsValue(sessionId),
    ipHash: ip ? hashAnalyticsValue(ip) : null,
    userAgent,
  };
}

export function buildProfileViewVisitorHash(sessionId: string, gymId: string): string {
  return buildVisitorHash(sessionId, gymId);
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { jwtVerify } from "jose";
import { COOKIE_NAME as ADMIN_COOKIE } from "@/lib/auth";
import { OWNER_COOKIE_NAME } from "@/lib/owner-auth";
import {
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_SESSION_HEADER,
  ANALYTICS_SESSION_MAX_AGE,
} from "@/lib/analytics-constants";

function attachAnalyticsSession(req: NextRequest, res: NextResponse): NextResponse {
  if (!req.cookies.get(ANALYTICS_SESSION_COOKIE)?.value) {
    const sessionId = randomUUID();
    res.cookies.set(ANALYTICS_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ANALYTICS_SESSION_MAX_AGE,
      path: "/",
    });
    res.headers.set(ANALYTICS_SESSION_HEADER, sessionId);
  }
  return res;
}

function nextWithAnalyticsSession(req: NextRequest): NextResponse {
  const existing = req.cookies.get(ANALYTICS_SESSION_COOKIE)?.value;
  if (existing) return NextResponse.next();

  const sessionId = randomUUID();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(ANALYTICS_SESSION_HEADER, sessionId);

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });

  res.cookies.set(ANALYTICS_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ANALYTICS_SESSION_MAX_AGE,
    path: "/",
  });

  return res;
}

function getSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(raw);
}

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.admin === true;
  } catch {
    return false;
  }
}

async function verifyOwnerToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.owner === true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin routes ──
  if (pathname.startsWith("/admin")) {
    if (
      pathname === "/admin/login" ||
      pathname.startsWith("/api/admin/login") ||
      pathname.startsWith("/api/admin/logout")
    ) {
      return attachAnalyticsSession(req, NextResponse.next());
    }

    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return attachAnalyticsSession(req, NextResponse.redirect(loginUrl));
    }

    if (await verifyAdminToken(token)) {
      return attachAnalyticsSession(req, NextResponse.next());
    }

    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
    return attachAnalyticsSession(req, res);
  }

  // ── Owner routes ──
  if (pathname.startsWith("/owner")) {
    if (
      pathname === "/owner/login" ||
      pathname === "/owner/register" ||
      pathname.startsWith("/api/owner/login") ||
      pathname.startsWith("/api/owner/register") ||
      pathname.startsWith("/api/owner/logout")
    ) {
      return attachAnalyticsSession(req, NextResponse.next());
    }

    const token = req.cookies.get(OWNER_COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/owner/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return attachAnalyticsSession(req, NextResponse.redirect(loginUrl));
    }

    if (await verifyOwnerToken(token)) {
      return attachAnalyticsSession(req, NextResponse.next());
    }

    const loginUrl = new URL("/owner/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set(OWNER_COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return attachAnalyticsSession(req, res);
  }

  // ── Public gym pages & analytics redirects ──
  if (
    pathname.startsWith("/gyms") ||
    pathname.startsWith("/api/analytics")
  ) {
    return nextWithAnalyticsSession(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/owner/:path*",
    "/gyms/:path*",
    "/api/analytics/:path*",
  ],
};

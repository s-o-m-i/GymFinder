import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME as ADMIN_COOKIE } from "@/lib/auth";
import { OWNER_COOKIE_NAME } from "@/lib/owner-auth";

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
      return NextResponse.next();
    }

    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (await verifyAdminToken(token)) return NextResponse.next();

    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
    return res;
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
      return NextResponse.next();
    }

    const token = req.cookies.get(OWNER_COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/owner/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (await verifyOwnerToken(token)) return NextResponse.next();

    const loginUrl = new URL("/owner/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set(OWNER_COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/owner/:path*"],
};

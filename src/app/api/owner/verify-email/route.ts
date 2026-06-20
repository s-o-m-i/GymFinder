import { NextRequest, NextResponse } from "next/server";
import { consumeOwnerAuthToken } from "@/lib/owner-auth-tokens";
import { prisma } from "@/lib/prisma";
import { signOwnerToken, OWNER_COOKIE_NAME, OWNER_COOKIE_MAX_AGE } from "@/lib/owner-auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/owner/verify-email?error=missing", req.url));
  }

  const owner = await consumeOwnerAuthToken(token, "EMAIL_VERIFICATION");
  if (!owner) {
    return NextResponse.redirect(new URL("/owner/verify-email?error=invalid", req.url));
  }

  if (!owner.emailVerified) {
    await prisma.gymOwner.update({
      where: { id: owner.id },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });
  }

  const sessionToken = await signOwnerToken({
    ownerId:          owner.id,
    email:            owner.email,
    businessCategory: owner.businessCategory,
  });

  const res = NextResponse.redirect(
    new URL(
      `/owner/dashboard?verified=1&email=${encodeURIComponent(owner.email)}`,
      req.url
    )
  );
  res.cookies.set(OWNER_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   OWNER_COOKIE_MAX_AGE,
    path:     "/",
  });

  return res;
}

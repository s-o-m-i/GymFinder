import { NextRequest, NextResponse } from "next/server";
import { consumeOwnerAuthToken } from "@/lib/owner-auth-tokens";
import { prisma } from "@/lib/prisma";
import { signOwnerToken, OWNER_COOKIE_NAME, OWNER_COOKIE_MAX_AGE } from "@/lib/owner-auth";

async function verifyOwnerEmail(token: string) {
  const owner = await consumeOwnerAuthToken(token, "EMAIL_VERIFICATION");
  if (!owner) {
    return null;
  }

  if (!owner.emailVerified) {
    await prisma.gymOwner.update({
      where: { id: owner.id },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });
  }

  return owner;
}

function setOwnerSessionCookie(res: NextResponse, owner: {
  id: string;
  email: string;
  businessCategory: import("@prisma/client").BusinessCategory;
}) {
  return signOwnerToken({
    ownerId: owner.id,
    email: owner.email,
    businessCategory: owner.businessCategory,
  }).then((sessionToken) => {
    res.cookies.set(OWNER_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: OWNER_COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  });
}

/** Legacy email links — redirect to confirm page instead of auto-verifying (prevents inbox prefetch). */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/owner/verify-email?error=missing", req.url));
  }

  const confirmUrl = new URL("/owner/verify-email/confirm", req.url);
  confirmUrl.searchParams.set("token", token);
  return NextResponse.redirect(confirmUrl);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token : "";

    if (!token) {
      return NextResponse.json({ error: "Verification token is required." }, { status: 400 });
    }

    const owner = await verifyOwnerEmail(token);
    if (!owner) {
      return NextResponse.json(
        { error: "This verification link is invalid or has expired." },
        { status: 400 }
      );
    }

    const res = NextResponse.json({
      success: true,
      email: owner.email,
    });

    await setOwnerSessionCookie(res, owner);
    return res;
  } catch (error) {
    console.error("POST /api/owner/verify-email error:", error);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signOwnerToken, OWNER_COOKIE_NAME, OWNER_COOKIE_MAX_AGE } from "@/lib/owner-auth";
import { verifyOwnerEmailOtp } from "@/lib/owner-auth-tokens";
import { ownerOtpVerifySchema } from "@/lib/validations/owner-auth";

/** Legacy link emails — send owners to the OTP page instead. */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const url = new URL("/owner/verify-email", req.url);
  if (email) url.searchParams.set("email", email);
  url.searchParams.set("pending", "1");
  return NextResponse.redirect(url);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ownerOtpVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid verification code." },
        { status: 400 }
      );
    }

    const owner = await verifyOwnerEmailOtp(parsed.data.email, parsed.data.code);
    if (!owner) {
      return NextResponse.json(
        { error: "Invalid or expired code. Request a new one and try again." },
        { status: 400 }
      );
    }

    if (!owner.emailVerified) {
      await prisma.gymOwner.update({
        where: { id: owner.id },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      });
    }

    const sessionToken = await signOwnerToken({
      ownerId: owner.id,
      email: owner.email,
      businessCategory: owner.businessCategory,
    });

    const res = NextResponse.json({
      success: true,
      email: owner.email,
    });

    res.cookies.set(OWNER_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: OWNER_COOKIE_MAX_AGE,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("POST /api/owner/verify-email error:", error);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}

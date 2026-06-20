import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signOwnerToken, OWNER_COOKIE_NAME, OWNER_COOKIE_MAX_AGE } from "@/lib/owner-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const owner = await prisma.gymOwner.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!owner || !(await verifyPassword(password, owner.passwordHash))) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!owner.emailVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email before signing in.",
          requiresVerification: true,
          email: owner.email,
        },
        { status: 403 }
      );
    }

    const token = await signOwnerToken({
      ownerId:          owner.id,
      email:            owner.email,
      businessCategory: owner.businessCategory,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set(OWNER_COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   OWNER_COOKIE_MAX_AGE,
      path:     "/",
    });

    return res;
  } catch (error) {
    console.error("POST /api/owner/login error:", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}

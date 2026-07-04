import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  COMMUNITY_COOKIE_MAX_AGE,
  COMMUNITY_COOKIE_NAME,
  getCommunitySession,
  signCommunityToken,
} from "@/lib/community-auth";

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.communityUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const user = await prisma.communityUser.create({
      data: {
        email,
        fullName: parsed.data.fullName.trim(),
        passwordHash: await hashPassword(parsed.data.password),
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const token = await signCommunityToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set(COMMUNITY_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COMMUNITY_COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("Community register error:", error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.communityUser.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await signCommunityToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set(COMMUNITY_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COMMUNITY_COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("Community login error:", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}

export async function GET() {
  const session = await getCommunitySession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    userId: session.userId,
    fullName: session.fullName,
  });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COMMUNITY_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

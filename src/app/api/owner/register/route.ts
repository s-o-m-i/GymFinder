import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signOwnerToken, OWNER_COOKIE_NAME, OWNER_COOKIE_MAX_AGE } from "@/lib/owner-auth";
import type { BusinessCategory } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, businessCategory } = body as {
      name:             string;
      email:            string;
      password:         string;
      phone?:           string;
      businessCategory: BusinessCategory;
    };

    if (!name?.trim() || !email?.trim() || !password || !businessCategory) {
      return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
    }

    if (!["gym", "fighting_club"].includes(businessCategory)) {
      return NextResponse.json({ error: "Invalid business category." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.gymOwner.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const owner = await prisma.gymOwner.create({
      data: {
        name:             name.trim(),
        email:            normalizedEmail,
        passwordHash,
        phone:            phone?.trim() || null,
        businessCategory,
      },
    });

    const token = await signOwnerToken({
      ownerId:          owner.id,
      email:            owner.email,
      businessCategory: owner.businessCategory,
    });

    const res = NextResponse.json({ success: true, ownerId: owner.id });
    res.cookies.set(OWNER_COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   OWNER_COOKIE_MAX_AGE,
      path:     "/",
    });

    return res;
  } catch (error) {
    console.error("POST /api/owner/register error:", error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  COMMUNITY_COOKIE_MAX_AGE,
  COMMUNITY_COOKIE_NAME,
  signCommunityToken,
} from "@/lib/community-auth";
import {
  OWNER_COOKIE_MAX_AGE,
  OWNER_COOKIE_NAME,
  signOwnerToken,
} from "@/lib/owner-auth";
import {
  TRAINER_COOKIE_MAX_AGE,
  TRAINER_COOKIE_NAME,
  signTrainerToken,
} from "@/lib/trainer-auth";
import { loginTrainerWithPassword } from "@/services/trainer/trainer-auth.service";

const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    const owner = await prisma.gymOwner.findUnique({ where: { email } });
    if (owner && (await verifyPassword(password, owner.passwordHash))) {
      if (!owner.emailVerified) {
        return NextResponse.json(
          {
            error: "Please verify your email before signing in.",
            requiresVerification: true,
            role: "owner",
            email: owner.email,
            redirect: `/owner/verify-email?email=${encodeURIComponent(owner.email)}&pending=1`,
          },
          { status: 403 }
        );
      }

      const token = await signOwnerToken({
        ownerId: owner.id,
        email: owner.email,
        businessCategory: owner.businessCategory,
      });

      const res = NextResponse.json({
        success: true,
        role: "owner",
        redirect: "/owner/dashboard",
      });
      res.cookies.set(OWNER_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: OWNER_COOKIE_MAX_AGE,
        path: "/",
      });
      return res;
    }

    const trainerResult = await loginTrainerWithPassword(email, password);
    if (trainerResult.ok) {
      const token = await signTrainerToken({
        accountId: trainerResult.accountId,
        email: trainerResult.email,
        trainerId: trainerResult.trainerId,
      });

      const res = NextResponse.json({
        success: true,
        role: "trainer",
        redirect: trainerResult.trainerId ? "/trainer/dashboard" : "/trainer/dashboard/profile",
      });
      res.cookies.set(TRAINER_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: TRAINER_COOKIE_MAX_AGE,
        path: "/",
      });
      return res;
    }

    if (
      !trainerResult.ok &&
      "requiresVerification" in trainerResult &&
      trainerResult.requiresVerification
    ) {
      return NextResponse.json(
        {
          error: trainerResult.error,
          requiresVerification: true,
          role: "trainer",
          email: trainerResult.email,
          redirect: `/trainer/verify-email?email=${encodeURIComponent(trainerResult.email ?? email)}&pending=1`,
        },
        { status: trainerResult.status }
      );
    }

    const communityUser = await prisma.communityUser.findUnique({ where: { email } });
    if (communityUser && (await verifyPassword(password, communityUser.passwordHash))) {
      const token = await signCommunityToken({
        userId: communityUser.id,
        email: communityUser.email,
        fullName: communityUser.fullName,
      });

      const res = NextResponse.json({
        success: true,
        role: "user",
        redirect: "/user/dashboard/success-stories",
      });
      res.cookies.set(COMMUNITY_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COMMUNITY_COOKIE_MAX_AGE,
        path: "/",
      });
      return res;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  } catch (error) {
    console.error("POST /api/auth/sign-in error:", error);
    return NextResponse.json({ error: "Sign in failed." }, { status: 500 });
  }
}

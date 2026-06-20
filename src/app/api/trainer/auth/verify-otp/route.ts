import { NextRequest, NextResponse } from "next/server";
import { trainerOtpVerifySchema } from "@/lib/validations/trainer";
import { verifyTrainerLoginOtp } from "@/services/trainer/trainer-auth.service";
import {
  signTrainerToken,
  TRAINER_COOKIE_MAX_AGE,
  TRAINER_COOKIE_NAME,
} from "@/lib/trainer-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = trainerOtpVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid code." },
        { status: 400 }
      );
    }

    const result = await verifyTrainerLoginOtp(parsed.data.email, parsed.data.code);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const token = await signTrainerToken({
      accountId: result.accountId,
      email: result.email,
      trainerId: result.trainerId,
    });

    const res = NextResponse.json({
      success: true,
      trainerId: result.trainerId,
      needsProfile: !result.trainerId,
    });

    res.cookies.set(TRAINER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: TRAINER_COOKIE_MAX_AGE,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("POST /api/trainer/auth/verify-otp error:", error);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}

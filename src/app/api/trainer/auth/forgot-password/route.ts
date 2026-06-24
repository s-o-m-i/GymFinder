import { NextRequest, NextResponse } from "next/server";
import { trainerForgotPasswordSchema } from "@/lib/validations/trainer-auth";
import { requestTrainerPasswordResetOtp } from "@/services/trainer/trainer-auth.service";
import { formatOwnerEmailError } from "@/lib/email-dev";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = trainerForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const result = await requestTrainerPasswordResetOtp(parsed.data.email);

    return NextResponse.json({
      success: true,
      message: result.message,
      email: "email" in result ? result.email : undefined,
      devOtpCode: "devOtpCode" in result ? result.devOtpCode : undefined,
    });
  } catch (error) {
    console.error("POST /api/trainer/auth/forgot-password error:", error);
    return NextResponse.json(
      { error: formatOwnerEmailError(error) },
      { status: 503 }
    );
  }
}

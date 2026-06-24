import { NextRequest, NextResponse } from "next/server";
import { trainerResendVerificationSchema } from "@/lib/validations/trainer-auth";
import { resendTrainerVerificationOtp } from "@/services/trainer/trainer-auth.service";
import { formatOwnerEmailError } from "@/lib/email-dev";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = trainerResendVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const result = await resendTrainerVerificationOtp(parsed.data.email);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      devOtpCode: "devOtpCode" in result ? result.devOtpCode : undefined,
    });
  } catch (error) {
    console.error("POST /api/trainer/auth/resend-verification error:", error);
    return NextResponse.json(
      { error: formatOwnerEmailError(error) },
      { status: 503 }
    );
  }
}

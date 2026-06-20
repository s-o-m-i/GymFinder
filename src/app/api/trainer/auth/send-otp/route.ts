import { NextRequest, NextResponse } from "next/server";
import { trainerOtpSendSchema } from "@/lib/validations/trainer";
import { sendTrainerLoginOtp } from "@/services/trainer/trainer-auth.service";
import { formatOwnerEmailError } from "@/lib/email-dev";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = trainerOtpSendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid email." },
        { status: 400 }
      );
    }

    const result = await sendTrainerLoginOtp(parsed.data.email);

    return NextResponse.json({
      success: true,
      email: result.email,
      isNewAccount: result.isNewAccount,
      devOtpCode: "devOtpCode" in result ? result.devOtpCode : undefined,
    });
  } catch (error) {
    console.error("POST /api/trainer/auth/send-otp error:", error);
    return NextResponse.json(
      { error: formatOwnerEmailError(error) },
      { status: 503 }
    );
  }
}

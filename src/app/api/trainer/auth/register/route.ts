import { NextRequest, NextResponse } from "next/server";
import { trainerRegisterSchema } from "@/lib/validations/trainer-auth";
import { registerTrainerAccount } from "@/services/trainer/trainer-auth.service";
import { formatOwnerEmailError } from "@/lib/email-dev";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = trainerRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid registration data." },
        { status: 400 }
      );
    }

    const result = await registerTrainerAccount(parsed.data);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          requiresVerification: "requiresVerification" in result ? result.requiresVerification : undefined,
          email: "email" in result ? result.email : undefined,
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email: result.email,
      devOtpCode: "devOtpCode" in result ? result.devOtpCode : undefined,
    });
  } catch (error) {
    console.error("POST /api/trainer/auth/register error:", error);
    return NextResponse.json(
      { error: formatOwnerEmailError(error) },
      { status: 503 }
    );
  }
}

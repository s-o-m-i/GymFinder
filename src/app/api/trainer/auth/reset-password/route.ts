import { NextRequest, NextResponse } from "next/server";
import { trainerResetPasswordSchema } from "@/lib/validations/trainer-auth";
import { resetTrainerPasswordWithOtp } from "@/services/trainer/trainer-auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = trainerResetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const result = await resetTrainerPasswordWithOtp(
      parsed.data.email,
      parsed.data.code,
      parsed.data.password
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("POST /api/trainer/auth/reset-password error:", error);
    return NextResponse.json({ error: "Password reset failed." }, { status: 500 });
  }
}

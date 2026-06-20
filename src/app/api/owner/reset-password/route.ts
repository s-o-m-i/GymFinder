import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { consumeOwnerAuthToken } from "@/lib/owner-auth-tokens";
import { ownerResetPasswordSchema } from "@/lib/validations/owner-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ownerResetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const owner = await consumeOwnerAuthToken(parsed.data.token, "PASSWORD_RESET");
    if (!owner) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await prisma.gymOwner.update({
      where: { id: owner.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated. You can now sign in.",
    });
  } catch (error) {
    console.error("POST /api/owner/reset-password error:", error);
    return NextResponse.json({ error: "Password reset failed." }, { status: 500 });
  }
}

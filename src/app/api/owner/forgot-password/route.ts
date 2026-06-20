import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ownerForgotPasswordSchema } from "@/lib/validations/owner-auth";
import { createOwnerAuthToken } from "@/lib/owner-auth-tokens";
import { sendOwnerPasswordResetEmail } from "@/services/owner-email.service";
import {
  buildOwnerPasswordResetUrl,
  formatOwnerEmailError,
  isDevEmailLinksEnabled,
  isResendRecipientRestrictionError,
  logDevEmailLink,
} from "@/lib/email-dev";

const GENERIC_MESSAGE =
  "If an account exists for that email, a password reset link has been sent.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ownerForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const owner = await prisma.gymOwner.findUnique({
      where: { email: parsed.data.email },
    });

    if (owner?.emailVerified) {
      const token = await createOwnerAuthToken(owner.id, "PASSWORD_RESET");
      const resetUrl = buildOwnerPasswordResetUrl(token);
      logDevEmailLink("Owner password reset link", resetUrl);

      try {
        await sendOwnerPasswordResetEmail({
          to: owner.email,
          name: owner.name,
          token,
        });
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        const message =
          emailError instanceof Error ? emailError.message : "Email send failed";

        if (
          isDevEmailLinksEnabled() &&
          isResendRecipientRestrictionError(message)
        ) {
          return NextResponse.json({
            success: true,
            message: "Resend test mode: use the reset link below.",
            devResetUrl: resetUrl,
          });
        }

        return NextResponse.json(
          { error: formatOwnerEmailError(emailError) },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("POST /api/owner/forgot-password error:", error);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}

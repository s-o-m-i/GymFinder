import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ownerResendVerificationSchema } from "@/lib/validations/owner-auth";
import { createOwnerAuthToken } from "@/lib/owner-auth-tokens";
import { sendOwnerVerificationEmail } from "@/services/owner-email.service";
import {
  buildOwnerVerificationUrl,
  formatOwnerEmailError,
  isDevEmailLinksEnabled,
  isResendRecipientRestrictionError,
  logDevEmailLink,
} from "@/lib/email-dev";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ownerResendVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const owner = await prisma.gymOwner.findUnique({
      where: { email: parsed.data.email },
    });

    if (!owner) {
      return NextResponse.json({
        success: true,
        message: "If an unverified account exists, a verification email has been sent.",
      });
    }

    if (owner.emailVerified) {
      return NextResponse.json(
        { error: "This email is already verified. You can sign in." },
        { status: 400 }
      );
    }

    const token = await createOwnerAuthToken(owner.id, "EMAIL_VERIFICATION");
    const verificationUrl = buildOwnerVerificationUrl(token);
    logDevEmailLink("Owner verification link", verificationUrl);

    try {
      await sendOwnerVerificationEmail({
        to: owner.email,
        name: owner.name,
        token,
      });
    } catch (emailError) {
      console.error("POST /api/owner/resend-verification email error:", emailError);
      const message =
        emailError instanceof Error ? emailError.message : "Email send failed";

      if (
        isDevEmailLinksEnabled() &&
        isResendRecipientRestrictionError(message)
      ) {
        return NextResponse.json({
          success: true,
          message: "Resend test mode: use the verification link below.",
          devVerificationUrl: verificationUrl,
        });
      }

      return NextResponse.json(
        { error: formatOwnerEmailError(emailError) },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent.",
    });
  } catch (error) {
    console.error("POST /api/owner/resend-verification error:", error);
    return NextResponse.json(
      { error: "Could not send verification email." },
      { status: 500 }
    );
  }
}

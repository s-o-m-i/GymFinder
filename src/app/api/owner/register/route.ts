import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createOwnerAuthToken } from "@/lib/owner-auth-tokens";
import { sendOwnerVerificationEmail } from "@/services/owner-email.service";
import {
  buildOwnerVerificationUrl,
  formatOwnerEmailError,
  isDevEmailLinksEnabled,
  isResendRecipientRestrictionError,
  logDevEmailLink,
} from "@/lib/email-dev";
import type { BusinessCategory } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, businessCategory } = body as {
      name:             string;
      email:            string;
      password:         string;
      phone:            string;
      businessCategory: BusinessCategory;
    };

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password || !businessCategory) {
      return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
    }

    const normalizedPhone = phone.trim();
    const phoneDigits = normalizedPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }

    if (!["gym", "fighting_club"].includes(businessCategory)) {
      return NextResponse.json({ error: "Invalid business category." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.gymOwner.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      if (!existing.emailVerified) {
        return NextResponse.json(
          {
            error: "An account with this email already exists but is not verified.",
            requiresVerification: true,
            email: normalizedEmail,
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const owner = await prisma.gymOwner.create({
      data: {
        name:             name.trim(),
        email:            normalizedEmail,
        passwordHash,
        phone:            normalizedPhone,
        businessCategory,
        emailVerified:    false,
      },
    });

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
      console.error("Failed to send verification email:", emailError);
      const message =
        emailError instanceof Error ? emailError.message : "Email send failed";

      if (
        isDevEmailLinksEnabled() &&
        isResendRecipientRestrictionError(message)
      ) {
        return NextResponse.json({
          success: true,
          requiresVerification: true,
          email: owner.email,
          devVerificationUrl: verificationUrl,
        });
      }

      await prisma.gymOwner.delete({ where: { id: owner.id } });
      return NextResponse.json(
        { error: formatOwnerEmailError(emailError) },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email: owner.email,
    });
  } catch (error) {
    console.error("POST /api/owner/register error:", error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}

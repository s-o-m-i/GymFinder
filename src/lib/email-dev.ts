import { getAppBaseUrl } from "@/lib/resend";

export function isDevEmailLinksEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.OWNER_DEV_EMAIL_LINKS !== "false"
  );
}

export function buildOwnerVerificationUrl(token: string): string {
  return `${getAppBaseUrl()}/owner/verify-email/confirm?token=${encodeURIComponent(token)}`;
}

export function buildOwnerPasswordResetUrl(token: string): string {
  return `${getAppBaseUrl()}/owner/reset-password?token=${encodeURIComponent(token)}`;
}

export function isResendRecipientRestrictionError(message: string): boolean {
  return (
    message.includes("only send testing emails") ||
    message.includes("verify a domain")
  );
}

export function formatOwnerEmailError(error: unknown): string {
  const raw =
    error instanceof Error ? error.message : "Could not send email. Please try again.";

  if (isResendRecipientRestrictionError(raw)) {
    const allowed = process.env.RESEND_DEV_RECIPIENT_EMAIL;
    if (allowed) {
      return `Email could not be sent to this address. During testing, use ${allowed} or verify your domain at resend.com/domains.`;
    }
    return "Email could not be sent to this address. Verify your domain at resend.com/domains, or use your Resend account email while testing.";
  }

  if (raw.includes("domain is not verified")) {
    return "Email sender domain is not verified. Set RESEND_FROM_EMAIL to FitnessAdda PK <onboarding@resend.dev> for local testing.";
  }

  return raw.replace(/^(Verification email failed|Password reset email failed):\s*/i, "");
}

export function logDevEmailLink(label: string, url: string) {
  if (!isDevEmailLinksEnabled()) return;
  console.log(`\n[dev email] ${label}:\n${url}\n`);
}

import "server-only";

import { getResendClient, getEmailFromAddress } from "@/lib/resend";
import { SITE_NAME } from "@/lib/constants";
import {
  buildOwnerPasswordResetUrl,
} from "@/lib/email-dev";

function emailShell(title: string, bodyHtml: string) {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="height:6px;background:linear-gradient(90deg,#FF6A3D,#0B2545);"></td>
            </tr>
            <tr>
              <td style="padding:32px 28px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#FF6A3D;">${SITE_NAME}</p>
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0B2545;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#6b7280;">If you did not request this, you can safely ignore this email.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function actionButton(label: string, href: string) {
  return `
    <p style="margin:24px 0;">
      <a href="${href}" style="display:inline-block;background:#0B2545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:12px;">
        ${label}
      </a>
    </p>`;
}

function assertResendSuccess(
  result: { data: unknown; error: { message: string } | null },
  context: string
) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
}

export async function sendOwnerVerificationOtpEmail(input: {
  to: string;
  name: string;
  code: string;
}) {
  const html = emailShell(
    "Verify your email",
    `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">Hi ${input.name},</p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
        Thanks for registering on ${SITE_NAME}. Enter this code on the verification page to activate your owner account.
      </p>
      <p style="margin:0 0 8px;font-size:32px;font-weight:700;letter-spacing:0.25em;color:#0B2545;font-family:monospace;">${input.code}</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">This code expires in 10 minutes.</p>
    `
  );

  const resend = getResendClient();
  const result = await resend.emails.send({
    from: getEmailFromAddress(),
    to: input.to,
    subject: `Your ${SITE_NAME} verification code`,
    html,
  });
  assertResendSuccess(result, "Verification email failed");
}

export async function sendOwnerPasswordResetEmail(input: {
  to: string;
  name: string;
  token: string;
}) {
  const resetUrl = buildOwnerPasswordResetUrl(input.token);
  const html = emailShell(
    "Reset your password",
    `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">Hi ${input.name},</p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
        We received a request to reset the password for your ${SITE_NAME} owner account.
      </p>
      ${actionButton("Reset Password", resetUrl)}
      <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">This link expires in 1 hour. If you did not request a reset, no action is needed.</p>
    `
  );

  const resend = getResendClient();
  const result = await resend.emails.send({
    from: getEmailFromAddress(),
    to: input.to,
    subject: `Reset your ${SITE_NAME} password`,
    html,
  });
  assertResendSuccess(result, "Password reset email failed");
}

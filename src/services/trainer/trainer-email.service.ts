import "server-only";

import { getResendClient, getEmailFromAddress } from "@/lib/resend";
import { SITE_NAME } from "@/lib/constants";

function assertResendSuccess(
  result: { data: unknown; error: { message: string } | null },
  context: string
) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
}

export async function sendTrainerVerificationOtpEmail(input: {
  to: string;
  name: string;
  code: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:32px 16px;background:#f4f6f8;font-family:Arial,sans-serif;">
    <table width="100%" style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
      <tr><td style="height:6px;background:linear-gradient(90deg,#FF6A3D,#0B2545);"></td></tr>
      <tr>
        <td style="padding:32px 28px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#FF6A3D;text-transform:uppercase;">${SITE_NAME}</p>
          <h1 style="margin:0 0 12px;font-size:22px;color:#0B2545;">Verify your trainer account</h1>
          <p style="margin:0 0 12px;font-size:15px;color:#374151;">Hi ${input.name}, enter this code on the verification page to activate your trainer account.</p>
          <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:0.25em;color:#0B2545;font-family:monospace;">${input.code}</p>
          <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">This code expires in 10 minutes.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const resend = getResendClient();
  const result = await resend.emails.send({
    from: getEmailFromAddress(),
    to: input.to,
    subject: `Your ${SITE_NAME} trainer verification code`,
    html,
  });

  assertResendSuccess(result, "Trainer verification email failed");
}

/** @deprecated Legacy passwordless login */
export async function sendTrainerOtpEmail(input: { to: string; code: string }) {
  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:32px 16px;background:#f4f6f8;font-family:Arial,sans-serif;">
    <table width="100%" style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
      <tr><td style="height:6px;background:linear-gradient(90deg,#FF6A3D,#0B2545);"></td></tr>
      <tr>
        <td style="padding:32px 28px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#FF6A3D;text-transform:uppercase;">${SITE_NAME}</p>
          <h1 style="margin:0 0 12px;font-size:22px;color:#0B2545;">Your trainer login code</h1>
          <p style="margin:0 0 20px;font-size:15px;color:#374151;">Use this code to sign in to your trainer account. It expires in 10 minutes.</p>
          <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:0.25em;color:#0B2545;font-family:monospace;">${input.code}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const resend = getResendClient();
  const result = await resend.emails.send({
    from: getEmailFromAddress(),
    to: input.to,
    subject: `Your ${SITE_NAME} trainer login code`,
    html,
  });

  assertResendSuccess(result, "Trainer OTP email failed");
}

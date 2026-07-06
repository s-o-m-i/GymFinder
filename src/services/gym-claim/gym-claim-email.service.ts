import "server-only";

import { getResendClient, getEmailFromAddress } from "@/lib/resend";
import { SITE_NAME } from "@/lib/constants";
import { getAppBaseUrl } from "@/lib/resend";
import { resolveDevAwareEmailRecipient } from "@/lib/email-dev";

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

async function sendClaimEmail(input: { to: string; subject: string; html: string }) {
  const resend = getResendClient();
  const result = await resend.emails.send({
    from: getEmailFromAddress(),
    to: resolveDevAwareEmailRecipient(input.to),
    subject: input.subject,
    html: input.html,
  });
  if (result.error) {
    throw new Error(`Claim email failed: ${result.error.message}`);
  }
}

export async function sendGymClaimSubmittedEmail(input: {
  to: string;
  name: string;
  gymName: string;
}) {
  const html = emailShell(
    "We received your Gym Claim",
    `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">Hi ${input.name},</p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
        Your claim for <strong>${input.gymName}</strong> has been submitted successfully.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
        Our team will verify your information and contact you if necessary. You will receive an email once your claim is reviewed.
      </p>
    `
  );
  await sendClaimEmail({ to: input.to, subject: "We received your Gym Claim", html });
}

export async function sendGymClaimApprovedEmail(input: {
  to: string;
  name: string;
  gymName: string;
  gymSlug: string;
}) {
  const dashboardUrl = `${getAppBaseUrl()}/owner/dashboard`;
  const profileUrl = `${getAppBaseUrl()}/gyms/${input.gymSlug}`;
  const html = emailShell(
    "Congratulations! Your Gym Profile has been Claimed",
    `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">Hi ${input.name},</p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
        Great news — your claim for <strong>${input.gymName}</strong> has been approved. You now have full access to manage your gym profile on ${SITE_NAME}.
      </p>
      ${actionButton("Open Gym Dashboard", dashboardUrl)}
      <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">
        <a href="${profileUrl}" style="color:#FF6A3D;">View your live profile</a>
      </p>
    `
  );
  await sendClaimEmail({
    to: input.to,
    subject: "Congratulations! Your Gym Profile has been Claimed",
    html,
  });
}

export async function sendGymClaimRejectedEmail(input: {
  to: string;
  name: string;
  gymName: string;
  reason?: string;
}) {
  const html = emailShell(
    "Your Claim Request Requires Attention",
    `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">Hi ${input.name},</p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
        We were unable to approve your claim for <strong>${input.gymName}</strong> at this time.
      </p>
      ${
        input.reason
          ? `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;"><strong>Reason:</strong> ${input.reason}</p>`
          : ""
      }
      <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
        If you believe this was a mistake, please contact our support team with additional verification details.
      </p>
    `
  );
  await sendClaimEmail({
    to: input.to,
    subject: "Your Claim Request Requires Attention",
    html,
  });
}

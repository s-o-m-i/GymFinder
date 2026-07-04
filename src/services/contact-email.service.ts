import "server-only";

import { getResendClient, getEmailFromAddress } from "@/lib/resend";
import { SITE_NAME } from "@/lib/constants";
import { resolveDevAwareEmailRecipient } from "@/lib/email-dev";
import {
  contactSubjectLabel,
  type ContactFormValues,
} from "@/lib/validations/contact-form";
import { CONTACT_EMAILS } from "@/lib/trust-pages/contact-data";

function contactEmailShell(title: string, bodyHtml: string) {
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactFormEmail(values: ContactFormValues): Promise<void> {
  const subjectLabel = contactSubjectLabel(values.subject);
  const safeName = escapeHtml(values.fullName);
  const safeEmail = escapeHtml(values.email);
  const safePhone = escapeHtml(values.phone);
  const safeMessage = escapeHtml(values.message).replace(/\n/g, "<br>");

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;color:#374151;"><strong>Subject:</strong> ${escapeHtml(subjectLabel)}</p>
    <p style="margin:0 0 12px;font-size:14px;color:#374151;"><strong>From:</strong> ${safeName}</p>
    <p style="margin:0 0 12px;font-size:14px;color:#374151;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
    <p style="margin:0 0 12px;font-size:14px;color:#374151;"><strong>Phone:</strong> ${safePhone}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
    <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${safeMessage}</p>
  `;

  const intendedRecipient = CONTACT_EMAILS.support;
  const to = resolveDevAwareEmailRecipient(intendedRecipient);

  if (process.env.NODE_ENV === "development" && to !== intendedRecipient) {
    console.log(
      `[contact] Dev mode: delivering to ${to} (intended: ${intendedRecipient})`
    );
  }

  const resend = getResendClient();
  const result = await resend.emails.send({
    from: getEmailFromAddress(),
    to,
    replyTo: values.email,
    subject: `[Contact] ${subjectLabel} — ${values.fullName}`,
    html: contactEmailShell(`New contact form submission`, bodyHtml),
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
}

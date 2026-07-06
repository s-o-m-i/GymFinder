import { NextResponse } from "next/server";
import { formatOwnerEmailError } from "@/lib/email-dev";
import { contactFormSchema } from "@/lib/validations/contact-form";
import { sendContactFormEmail } from "@/services/contact-email.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid form data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    await sendContactFormEmail(parsed.data);

    const { notifyContactInquiry } = await import("@/services/notification/notification.dispatch");
    void notifyContactInquiry({
      name: parsed.data.fullName,
      subject: parsed.data.subject,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact]", error);

    const message =
      error instanceof Error && error.message.includes("RESEND_API_KEY")
        ? "Email service is not configured. Please try again later."
        : formatOwnerEmailError(error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

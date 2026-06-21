import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  ANALYTICS_SESSION_COOKIE,
  ensureAnalyticsSession,
  getAnalyticsVisitorContextFromRequest,
} from "@/lib/analytics-session";
import { trainerAnalyticsRedirectSchema } from "@/lib/validations/trainer-analytics";
import { trackTrainerClickWithContext } from "@/services/trainer-analytics.service";
import { buildTrainerWhatsAppUrl } from "@/lib/trainer-constants";
import { SITE_NAME } from "@/lib/constants";

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip");
}

function buildTelUrl(number: string): string {
  const cleaned = number.replace(/\D/g, "");
  const withCountry = cleaned.startsWith("92")
    ? cleaned
    : cleaned.startsWith("0")
      ? `92${cleaned.slice(1)}`
      : `92${cleaned}`;
  return `tel:+${withCountry}`;
}

export async function GET(request: NextRequest) {
  const parsed = trainerAnalyticsRedirectSchema.safeParse({
    trainerId: request.nextUrl.searchParams.get("trainerId"),
    event: request.nextUrl.searchParams.get("event"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { trainerId, event } = parsed.data;

  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId },
    select: {
      id: true,
      fullName: true,
      whatsappNumber: true,
      email: true,
      isPublished: true,
    },
  });

  if (!trainer || !trainer.isPublished) {
    return NextResponse.redirect(new URL("/trainers", request.url));
  }

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(ANALYTICS_SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = await ensureAnalyticsSession();
  }

  const context = getAnalyticsVisitorContextFromRequest(
    sessionId,
    trainerId,
    request.headers.get("user-agent"),
    getClientIp(request)
  );

  try {
    await trackTrainerClickWithContext(trainerId, event, context);
  } catch {
    // Still redirect — tracking failure must not block the visitor
  }

  let destination: string;
  switch (event) {
    case "WHATSAPP_CLICK":
      if (!trainer.whatsappNumber) {
        return NextResponse.redirect(new URL("/trainers", request.url));
      }
      destination = buildTrainerWhatsAppUrl(trainer.whatsappNumber, trainer.fullName);
      break;
    case "PHONE_CLICK":
      if (!trainer.whatsappNumber) {
        return NextResponse.redirect(new URL("/trainers", request.url));
      }
      destination = buildTelUrl(trainer.whatsappNumber);
      break;
    case "CONTACT_CLICK":
      if (!trainer.email) {
        return NextResponse.redirect(new URL("/trainers", request.url));
      }
      destination = `mailto:${trainer.email}?subject=${encodeURIComponent(
        `Training inquiry — ${trainer.fullName} on ${SITE_NAME}`
      )}`;
      break;
  }

  return NextResponse.redirect(destination);
}

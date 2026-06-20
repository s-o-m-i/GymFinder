import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  ANALYTICS_SESSION_COOKIE,
  ensureAnalyticsSession,
  getAnalyticsVisitorContextFromRequest,
} from "@/lib/analytics-session";
import { analyticsRedirectSchema } from "@/lib/validations/analytics";
import { trackClickWithContext } from "@/services/analytics.service";
import { buildGoogleMapsUrl, buildWhatsAppUrl } from "@/lib/utils";

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
  const parsed = analyticsRedirectSchema.safeParse({
    gymId: request.nextUrl.searchParams.get("gymId"),
    event: request.nextUrl.searchParams.get("event"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { gymId, event } = parsed.data;

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: {
      id: true,
      name: true,
      whatsappNumber: true,
      address: true,
      area: true,
      city: true,
      latitude: true,
      longitude: true,
      listingStatus: true,
    },
  });

  if (!gym || gym.listingStatus !== "approved") {
    return NextResponse.redirect(new URL("/gyms", request.url));
  }

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(ANALYTICS_SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = await ensureAnalyticsSession();
  }

  const context = getAnalyticsVisitorContextFromRequest(
    sessionId,
    gymId,
    request.headers.get("user-agent"),
    getClientIp(request)
  );

  try {
    await trackClickWithContext(gymId, event, context);
  } catch {
    // Still redirect — tracking failure must not block the visitor
  }

  let destination: string;
  switch (event) {
    case "WHATSAPP_CLICK":
      destination = buildWhatsAppUrl(gym.whatsappNumber, gym.name);
      break;
    case "PHONE_CLICK":
      destination = buildTelUrl(gym.whatsappNumber);
      break;
    case "DIRECTIONS_CLICK":
      destination = buildGoogleMapsUrl(
        `${gym.name}, ${gym.address}, ${gym.area}, ${gym.city}`,
        gym.latitude,
        gym.longitude
      );
      break;
  }

  return NextResponse.redirect(destination);
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  ANALYTICS_SESSION_COOKIE,
  ensureAnalyticsSession,
  getAnalyticsVisitorContextFromRequest,
} from "@/lib/analytics-session";
import { createGymLeadSchema } from "@/lib/validations/gym-lead";
import { buildGymLeadWhatsAppMessage, resolveLeadGoalLabel } from "@/lib/gym-leads";
import { createGymLead } from "@/services/gym-lead.service";
import { trackClickWithContext } from "@/services/analytics.service";
import { buildWhatsAppUrl } from "@/lib/utils";

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createGymLeadSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid lead data.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { gymId, name, goal, customGoal } = parsed.data;

    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: {
        id: true,
        name: true,
        whatsappNumber: true,
        listingStatus: true,
      },
    });

    if (!gym || gym.listingStatus !== "approved") {
      return NextResponse.json({ error: "Gym not found." }, { status: 404 });
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

    await createGymLead({
      gymId,
      name,
      goal,
      customGoal,
      sessionId,
      userAgent: request.headers.get("user-agent"),
    });

    try {
      await trackClickWithContext(gymId, "WHATSAPP_CLICK", context);
    } catch {
      // Lead is saved even if analytics tracking fails
    }

    const goalLabel = resolveLeadGoalLabel(goal, customGoal);
    const message = buildGymLeadWhatsAppMessage(gym.name, name, goalLabel);
    const redirectUrl = buildWhatsAppUrl(gym.whatsappNumber, gym.name, message);

    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error("POST /api/leads/gym error:", error);
    return NextResponse.json(
      { error: "Could not save your details. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ANALYTICS_SESSION_COOKIE,
  ensureAnalyticsSession,
  hashAnalyticsValue,
} from "@/lib/analytics-session";
import { aiGymSearchRequestSchema } from "@/lib/validations/ai-gym-search";
import { runAiGymSearch } from "@/lib/ai/run-ai-gym-search";

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = aiGymSearchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(ANALYTICS_SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = await ensureAnalyticsSession();
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent");

  try {
    const result = await runAiGymSearch(parsed.data.query, {
      sessionId,
      visitorHash: hashAnalyticsValue(`${sessionId}:ai-gym-search`),
      userAgent,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("AI gym search API error:", err);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}

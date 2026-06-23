import { NextRequest, NextResponse } from "next/server";
import { checkExpiredFeaturedGyms } from "@/services/featured/featured-gym.service";

/** Cron endpoint — secure with CRON_SECRET header in production. */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await checkExpiredFeaturedGyms();
  return NextResponse.json({ ok: true, ...result });
}

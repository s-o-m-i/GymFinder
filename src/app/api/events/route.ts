import { NextRequest, NextResponse } from "next/server";
import { getEventsListing } from "@/services/events/event.service";

export async function GET(req: NextRequest) {
  try {
    const result = await getEventsListing(
      Object.fromEntries(req.nextUrl.searchParams.entries()),
    );
    return NextResponse.json({
      events: result.events,
      total: result.total,
      page: result.page,
      limit: 12,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Failed to fetch events." }, { status: 500 });
  }
}

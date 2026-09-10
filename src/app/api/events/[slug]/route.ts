import { NextResponse } from "next/server";
import { getEventBySlug } from "@/services/events/event.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const event = await getEventBySlug(slug);
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    return NextResponse.json({ data: event });
  } catch (error) {
    console.error("GET /api/events/[slug] error:", error);
    return NextResponse.json({ error: "Failed to fetch event." }, { status: 500 });
  }
}

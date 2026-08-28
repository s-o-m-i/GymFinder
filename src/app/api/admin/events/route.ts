import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { adminEventSchema } from "@/lib/validations/admin-event";
import {
  createEventByAdmin,
  getAdminEvents,
} from "@/services/events/event.service";

export async function GET(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const events = await getAdminEvents();
    return NextResponse.json({ data: events });
  } catch (error) {
    console.error("GET /api/admin/events error:", error);
    return NextResponse.json({ error: "Failed to load events." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = adminEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const event = await createEventByAdmin({
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath(`/event/${event.slug}`);

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/events error:", error);
    return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
  }
}

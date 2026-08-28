import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { adminEventSchema } from "@/lib/validations/admin-event";
import {
  deleteEventByAdmin,
  getAdminEventById,
  updateEventByAdmin,
} from "@/services/events/event.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const event = await getAdminEventById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ data: event });
  } catch (error) {
    console.error("GET /api/admin/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to load event." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = adminEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const existingEvent = await getAdminEventById(id);
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const updated = await updateEventByAdmin(id, {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    });
    if (!updated) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");
    if (existingEvent.slug !== updated.slug) {
      revalidatePath(`/event/${existingEvent.slug}`);
    }
    revalidatePath(`/event/${updated.slug}`);

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PUT /api/admin/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to update event." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteEventByAdmin(id);
    if (!deleted) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");
    if (deleted.slug) {
      revalidatePath(`/event/${deleted.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
  }
}

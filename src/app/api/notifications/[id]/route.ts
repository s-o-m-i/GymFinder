import { NextRequest, NextResponse } from "next/server";
import { getNotificationRecipient } from "@/lib/notifications/recipient";
import { markNotificationRead } from "@/services/notification/notification-query.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const recipient = await getNotificationRecipient();
  if (!recipient) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const markRead = body.markRead !== false;

  if (markRead) {
    const ok = await markNotificationRead(id, recipient);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ success: true });
}

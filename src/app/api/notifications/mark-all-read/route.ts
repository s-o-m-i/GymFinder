import { NextResponse } from "next/server";
import { getNotificationRecipient } from "@/lib/notifications/recipient";
import { markAllNotificationsRead } from "@/services/notification/notification-query.service";

export async function POST() {
  const recipient = await getNotificationRecipient();
  if (!recipient) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await markAllNotificationsRead(recipient);
  return NextResponse.json({ success: true, count });
}

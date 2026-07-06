import { NextResponse } from "next/server";
import { getNotificationRecipient } from "@/lib/notifications/recipient";
import {
  getRecentNotifications,
  getUnreadNotificationCount,
} from "@/services/notification/notification-query.service";

export async function GET() {
  const recipient = await getNotificationRecipient();
  if (!recipient) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [items, unreadCount] = await Promise.all([
    getRecentNotifications(recipient),
    getUnreadNotificationCount(recipient),
  ]);

  return NextResponse.json({ items, unreadCount });
}

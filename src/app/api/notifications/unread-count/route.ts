import { NextResponse } from "next/server";
import { getNotificationRecipient } from "@/lib/notifications/recipient";
import { getUnreadNotificationCount } from "@/services/notification/notification-query.service";

export async function GET() {
  const recipient = await getNotificationRecipient();
  if (!recipient) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await getUnreadNotificationCount(recipient);
  return NextResponse.json({ count });
}

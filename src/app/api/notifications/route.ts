import { NextRequest, NextResponse } from "next/server";
import type { NotificationPriority, NotificationStatus, NotificationType } from "@prisma/client";
import { getNotificationRecipient } from "@/lib/notifications/recipient";
import {
  bulkUpdateNotifications,
  listNotifications,
  markAllNotificationsRead,
} from "@/services/notification/notification-query.service";

function parseStatus(value: string | null): NotificationStatus | "ALL" | undefined {
  if (!value || value === "ALL") return value === "ALL" ? "ALL" : undefined;
  if (value === "UNREAD" || value === "READ" || value === "ARCHIVED") return value;
  return undefined;
}

export async function GET(req: NextRequest) {
  const recipient = await getNotificationRecipient();
  if (!recipient) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const dateFromRaw = searchParams.get("dateFrom");
  const dateToRaw = searchParams.get("dateTo");

  const result = await listNotifications(recipient, {
    status: parseStatus(searchParams.get("status")),
    type: (searchParams.get("type") as NotificationType) || undefined,
    priority: (searchParams.get("priority") as NotificationPriority) || undefined,
    q: searchParams.get("q") || undefined,
    dateFrom: dateFromRaw ? new Date(dateFromRaw) : undefined,
    dateTo: dateToRaw ? new Date(dateToRaw) : undefined,
    page: Number(searchParams.get("page") || "1"),
    pageSize: Number(searchParams.get("pageSize") || "20"),
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const recipient = await getNotificationRecipient();
  if (!recipient) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = body.action as "read" | "archive" | "delete" | "mark_all_read";
    const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];

    if (action === "mark_all_read") {
      const count = await markAllNotificationsRead(recipient);
      return NextResponse.json({ success: true, count });
    }

    if (!["read", "archive", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const count = await bulkUpdateNotifications(ids, recipient, action);
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

import "server-only";

import type { NotificationStatus, NotificationType, NotificationPriority, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { NotificationRecipient } from "@/lib/notifications/recipient";

const RECENT_LIMIT = 10;
const DEFAULT_PAGE_SIZE = 20;

export interface NotificationListFilters {
  status?: NotificationStatus | "ALL";
  type?: NotificationType;
  priority?: NotificationPriority;
  q?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}

function recipientWhere(recipient: NotificationRecipient): Prisma.NotificationWhereInput {
  return {
    recipientUserId: recipient.userId,
    recipientRole: recipient.role,
  };
}

export async function getUnreadNotificationCount(recipient: NotificationRecipient) {
  return prisma.notification.count({
    where: {
      ...recipientWhere(recipient),
      status: "UNREAD",
    },
  });
}

export async function getRecentNotifications(recipient: NotificationRecipient) {
  return prisma.notification.findMany({
    where: recipientWhere(recipient),
    orderBy: { createdAt: "desc" },
    take: RECENT_LIMIT,
  });
}

export async function listNotifications(recipient: NotificationRecipient, filters: NotificationListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * pageSize;

  const where: Prisma.NotificationWhereInput = {
    ...recipientWhere(recipient),
    ...(filters.status && filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { message: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          createdAt: {
            ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
            ...(filters.dateTo ? { lte: filters.dateTo } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function markNotificationRead(id: string, recipient: NotificationRecipient) {
  const result = await prisma.notification.updateMany({
    where: { id, ...recipientWhere(recipient) },
    data: { status: "READ", readAt: new Date() },
  });
  return result.count > 0;
}

export async function markAllNotificationsRead(recipient: NotificationRecipient) {
  const result = await prisma.notification.updateMany({
    where: { ...recipientWhere(recipient), status: "UNREAD" },
    data: { status: "READ", readAt: new Date() },
  });
  return result.count;
}

export async function bulkUpdateNotifications(
  ids: string[],
  recipient: NotificationRecipient,
  action: "read" | "archive" | "delete"
) {
  if (ids.length === 0) return 0;

  const where = { id: { in: ids }, ...recipientWhere(recipient) };

  if (action === "delete") {
    const result = await prisma.notification.deleteMany({ where });
    return result.count;
  }

  const data =
    action === "read"
      ? { status: "READ" as const, readAt: new Date() }
      : { status: "ARCHIVED" as const };

  const result = await prisma.notification.updateMany({ where, data });
  return result.count;
}

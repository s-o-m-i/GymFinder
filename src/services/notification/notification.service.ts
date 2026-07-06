import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  NotificationEntityType,
  NotificationPriority,
  NotificationRecipientRole,
  NotificationType,
} from "@prisma/client";
import { NOTIFICATION_TYPE_META } from "@/lib/notifications/constants";

export interface CreateNotificationInput {
  recipientId: string;
  recipientRole: NotificationRecipientRole;
  senderId?: string;
  senderRole?: NotificationRecipientRole;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  image?: string;
  actionUrl?: string;
  entityType?: NotificationEntityType;
  entityId?: string;
  priority?: NotificationPriority;
}

/** Real-time delivery hook — wire Socket.IO / Pusher here later. */
function publishNotificationEvent(_notification: unknown) {
  // no-op for MVP
}

async function isInAppEnabled(
  recipientId: string,
  recipientRole: NotificationRecipientRole,
  type: NotificationType
): Promise<boolean> {
  const prefs = await prisma.notificationPreference.findUnique({
    where: {
      recipientUserId_recipientRole: {
        recipientUserId: recipientId,
        recipientRole,
      },
    },
  });

  if (!prefs) return true;
  if (!prefs.inAppEnabled) return false;

  const overrides = prefs.typeOverrides as Record<string, boolean> | null;
  if (overrides && overrides[type] === false) return false;

  return true;
}

export class NotificationService {
  static async create(input: CreateNotificationInput) {
    const enabled = await isInAppEnabled(input.recipientId, input.recipientRole, input.type);
    if (!enabled) return null;

    const meta = NOTIFICATION_TYPE_META[input.type];

    const notification = await prisma.notification.create({
      data: {
        recipientUserId: input.recipientId,
        recipientRole: input.recipientRole,
        senderUserId: input.senderId,
        senderRole: input.senderRole,
        type: input.type,
        title: input.title,
        message: input.message,
        icon: input.icon ?? meta.icon,
        image: input.image,
        actionUrl: input.actionUrl,
        entityType: input.entityType,
        entityId: input.entityId,
        priority: input.priority ?? meta.priority,
      },
    });

    publishNotificationEvent(notification);
    return notification;
  }

  static async createMany(inputs: CreateNotificationInput[]) {
    const results = await Promise.all(inputs.map((input) => NotificationService.create(input)));
    return results.filter((n) => n !== null);
  }
}

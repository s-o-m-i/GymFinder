import { getAdminSession } from "@/lib/auth";
import { getCommunitySession } from "@/lib/community-auth";
import { getOwnerSession } from "@/lib/owner-auth";
import { getTrainerSession } from "@/lib/trainer-auth";
import type { NotificationRecipientRole } from "@prisma/client";
import { PLATFORM_ADMIN_RECIPIENT_ID } from "./constants";

export interface NotificationRecipient {
  userId: string;
  role: NotificationRecipientRole;
}

export async function getNotificationRecipient(): Promise<NotificationRecipient | null> {
  const owner = await getOwnerSession();
  if (owner) return { userId: owner.ownerId, role: "OWNER" };

  const trainer = await getTrainerSession();
  if (trainer) return { userId: trainer.accountId, role: "TRAINER" };

  const community = await getCommunitySession();
  if (community) return { userId: community.userId, role: "COMMUNITY" };

  const isAdmin = await getAdminSession();
  if (isAdmin) return { userId: PLATFORM_ADMIN_RECIPIENT_ID, role: "ADMIN" };

  return null;
}

import "server-only";

import { prisma } from "@/lib/prisma";
import {
  buildProfileViewVisitorHash,
  getAnalyticsVisitorContext,
  isLikelyBot,
} from "@/lib/analytics-session";

const PROFILE_VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000;

async function eventIsTrackable(eventId: string): Promise<boolean> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });
  return event != null;
}

export async function trackEventView(eventId: string): Promise<boolean> {
  const context = await getAnalyticsVisitorContext(eventId);

  if (isLikelyBot(context.userAgent)) {
    return false;
  }

  const trackable = await eventIsTrackable(eventId);
  if (!trackable) return false;

  const visitorHash = buildProfileViewVisitorHash(context.sessionId, eventId);
  const since = new Date(Date.now() - PROFILE_VIEW_COOLDOWN_MS);

  const duplicate = await prisma.eventAnalyticsEvent.findFirst({
    where: {
      eventId,
      visitorHash,
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  if (duplicate) return false;

  await prisma.eventAnalyticsEvent.create({
    data: {
      eventId,
      sessionId: context.sessionHash,
      visitorHash,
      ipHash: context.ipHash,
      userAgent: context.userAgent?.slice(0, 512) ?? null,
    },
  });

  return true;
}

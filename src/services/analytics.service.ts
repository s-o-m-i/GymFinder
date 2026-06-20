import "server-only";

import type { AnalyticsEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildProfileViewVisitorHash,
  getAnalyticsVisitorContext,
  hashAnalyticsValue,
  isLikelyBot,
  type AnalyticsVisitorContext,
} from "@/lib/analytics-session";

const PROFILE_VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const CLICK_DEDUP_MS = 60 * 1000;

interface TrackEventInput {
  gymId: string;
  eventType: AnalyticsEventType;
  context: AnalyticsVisitorContext;
  visitorHash?: string;
  skipBotCheck?: boolean;
}

async function gymExistsAndApproved(gymId: string): Promise<boolean> {
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { id: true, listingStatus: true },
  });
  return gym?.listingStatus === "approved";
}

async function hasRecentDuplicate(
  gymId: string,
  eventType: AnalyticsEventType,
  visitorHash: string,
  since: Date
): Promise<boolean> {
  const existing = await prisma.gymAnalyticsEvent.findFirst({
    where: {
      gymId,
      eventType,
      visitorHash,
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  return existing != null;
}

async function recordEvent(input: TrackEventInput): Promise<boolean> {
  const { gymId, eventType, context, visitorHash, skipBotCheck } = input;

  if (!skipBotCheck && isLikelyBot(context.userAgent)) {
    return false;
  }

  const approved = await gymExistsAndApproved(gymId);
  if (!approved) return false;

  await prisma.gymAnalyticsEvent.create({
    data: {
      gymId,
      eventType,
      sessionId: context.sessionHash,
      visitorHash: visitorHash ?? context.sessionHash,
      ipHash: context.ipHash,
      userAgent: context.userAgent?.slice(0, 512) ?? null,
    },
  });

  return true;
}

export async function trackProfileView(gymId: string): Promise<boolean> {
  const context = await getAnalyticsVisitorContext(gymId);

  if (isLikelyBot(context.userAgent)) {
    return false;
  }

  const visitorHash = buildProfileViewVisitorHash(context.sessionId, gymId);
  const since = new Date(Date.now() - PROFILE_VIEW_COOLDOWN_MS);

  const duplicate = await hasRecentDuplicate(
    gymId,
    "PROFILE_VIEW",
    visitorHash,
    since
  );
  if (duplicate) return false;

  return recordEvent({
    gymId,
    eventType: "PROFILE_VIEW",
    context,
    visitorHash,
    skipBotCheck: true,
  });
}

async function trackClickEvent(
  gymId: string,
  eventType: Extract<
    AnalyticsEventType,
    "WHATSAPP_CLICK" | "PHONE_CLICK" | "DIRECTIONS_CLICK"
  >,
  context: AnalyticsVisitorContext
): Promise<boolean> {
  const visitorHash = hashAnalyticsValue(
    `${context.sessionId}:${gymId}:${eventType}`
  );
  const since = new Date(Date.now() - CLICK_DEDUP_MS);

  const duplicate = await hasRecentDuplicate(
    gymId,
    eventType,
    visitorHash,
    since
  );
  if (duplicate) return false;

  return recordEvent({
    gymId,
    eventType,
    context,
    visitorHash,
  });
}

export async function trackWhatsAppClick(gymId: string): Promise<boolean> {
  const context = await getAnalyticsVisitorContext(gymId);
  return trackClickEvent(gymId, "WHATSAPP_CLICK", context);
}

export async function trackPhoneClick(gymId: string): Promise<boolean> {
  const context = await getAnalyticsVisitorContext(gymId);
  return trackClickEvent(gymId, "PHONE_CLICK", context);
}

export async function trackDirectionsClick(gymId: string): Promise<boolean> {
  const context = await getAnalyticsVisitorContext(gymId);
  return trackClickEvent(gymId, "DIRECTIONS_CLICK", context);
}

export async function trackClickWithContext(
  gymId: string,
  eventType: Extract<
    AnalyticsEventType,
    "WHATSAPP_CLICK" | "PHONE_CLICK" | "DIRECTIONS_CLICK"
  >,
  context: AnalyticsVisitorContext
): Promise<boolean> {
  return trackClickEvent(gymId, eventType, context);
}

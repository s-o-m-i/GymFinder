import "server-only";

import type { TrainerLeadEventType } from "@prisma/client";
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

interface TrackTrainerEventInput {
  trainerId: string;
  eventType: TrainerLeadEventType;
  context: AnalyticsVisitorContext;
  visitorHash?: string;
  skipBotCheck?: boolean;
}

async function trainerIsTrackable(trainerId: string): Promise<boolean> {
  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId },
    select: { id: true, isPublished: true },
  });
  return trainer?.isPublished === true;
}

async function hasRecentDuplicate(
  trainerId: string,
  eventType: TrainerLeadEventType,
  visitorHash: string,
  since: Date
): Promise<boolean> {
  const existing = await prisma.trainerLeadEvent.findFirst({
    where: {
      trainerId,
      eventType,
      visitorHash,
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  return existing != null;
}

async function recordEvent(input: TrackTrainerEventInput): Promise<boolean> {
  const { trainerId, eventType, context, visitorHash, skipBotCheck } = input;

  if (!skipBotCheck && isLikelyBot(context.userAgent)) {
    return false;
  }

  const trackable = await trainerIsTrackable(trainerId);
  if (!trackable) return false;

  await prisma.trainerLeadEvent.create({
    data: {
      trainerId,
      eventType,
      sessionId: context.sessionHash,
      visitorHash: visitorHash ?? context.sessionHash,
      ipHash: context.ipHash,
      userAgent: context.userAgent?.slice(0, 512) ?? null,
    },
  });

  return true;
}

export async function trackTrainerProfileView(trainerId: string): Promise<boolean> {
  const context = await getAnalyticsVisitorContext(trainerId);

  if (isLikelyBot(context.userAgent)) {
    return false;
  }

  const visitorHash = buildProfileViewVisitorHash(context.sessionId, trainerId);
  const since = new Date(Date.now() - PROFILE_VIEW_COOLDOWN_MS);

  const duplicate = await hasRecentDuplicate(
    trainerId,
    "PROFILE_VIEW",
    visitorHash,
    since
  );
  if (duplicate) return false;

  return recordEvent({
    trainerId,
    eventType: "PROFILE_VIEW",
    context,
    visitorHash,
    skipBotCheck: true,
  });
}

async function trackClickEvent(
  trainerId: string,
  eventType: Extract<
    TrainerLeadEventType,
    "WHATSAPP_CLICK" | "PHONE_CLICK" | "CONTACT_CLICK"
  >,
  context: AnalyticsVisitorContext
): Promise<boolean> {
  const visitorHash = hashAnalyticsValue(
    `${context.sessionId}:${trainerId}:${eventType}`
  );
  const since = new Date(Date.now() - CLICK_DEDUP_MS);

  const duplicate = await hasRecentDuplicate(
    trainerId,
    eventType,
    visitorHash,
    since
  );
  if (duplicate) return false;

  return recordEvent({
    trainerId,
    eventType,
    context,
    visitorHash,
  });
}

export async function trackTrainerWhatsAppClick(trainerId: string): Promise<boolean> {
  const context = await getAnalyticsVisitorContext(trainerId);
  return trackClickEvent(trainerId, "WHATSAPP_CLICK", context);
}

export async function trackTrainerPhoneClick(trainerId: string): Promise<boolean> {
  const context = await getAnalyticsVisitorContext(trainerId);
  return trackClickEvent(trainerId, "PHONE_CLICK", context);
}

export async function trackTrainerContactClick(trainerId: string): Promise<boolean> {
  const context = await getAnalyticsVisitorContext(trainerId);
  return trackClickEvent(trainerId, "CONTACT_CLICK", context);
}

export async function trackTrainerClickWithContext(
  trainerId: string,
  eventType: Extract<
    TrainerLeadEventType,
    "WHATSAPP_CLICK" | "PHONE_CLICK" | "CONTACT_CLICK"
  >,
  context: AnalyticsVisitorContext
): Promise<boolean> {
  return trackClickEvent(trainerId, eventType, context);
}

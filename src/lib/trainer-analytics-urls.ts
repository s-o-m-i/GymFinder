import type { TrainerLeadEventType } from "@prisma/client";

const CLICK_EVENTS: TrainerLeadEventType[] = [
  "WHATSAPP_CLICK",
  "PHONE_CLICK",
  "CONTACT_CLICK",
];

export function isTrainerClickEvent(
  event: string
): event is Extract<
  TrainerLeadEventType,
  "WHATSAPP_CLICK" | "PHONE_CLICK" | "CONTACT_CLICK"
> {
  return CLICK_EVENTS.includes(event as TrainerLeadEventType);
}

export function trainerAnalyticsRedirectUrl(
  trainerId: string,
  event: Extract<
    TrainerLeadEventType,
    "WHATSAPP_CLICK" | "PHONE_CLICK" | "CONTACT_CLICK"
  >
): string {
  return `/api/analytics/trainer-redirect?trainerId=${encodeURIComponent(trainerId)}&event=${encodeURIComponent(event)}`;
}

import type { AnalyticsEventType } from "@prisma/client";

const CLICK_EVENTS: AnalyticsEventType[] = [
  "WHATSAPP_CLICK",
  "PHONE_CLICK",
  "DIRECTIONS_CLICK",
];

export function isClickEvent(event: string): event is AnalyticsEventType {
  return CLICK_EVENTS.includes(event as AnalyticsEventType);
}

export function analyticsRedirectUrl(
  gymId: string,
  event: AnalyticsEventType
): string {
  return `/api/analytics/redirect?gymId=${encodeURIComponent(gymId)}&event=${encodeURIComponent(event)}`;
}

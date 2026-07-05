export const GA_EVENTS = {
  whatsapp_click: "whatsapp_click",
  phone_click: "phone_click",
  profile_created: "profile_created",
  trainer_registered: "trainer_registered",
  filter_used: "filter_used",
  event_registered: "event_registered",
  share_story: "share_story",
} as const;

export type GAEventName = (typeof GA_EVENTS)[keyof typeof GA_EVENTS];

export type GAEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function sanitizeParams(params?: GAEventParams): Record<string, string | number | boolean> {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string | number | boolean] =>
        entry[1] !== undefined && entry[1] !== ""
    )
  );
}

export function trackGAEvent(eventName: GAEventName, params?: GAEventParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, sanitizeParams(params));
}

export function trackFilterUsed(
  listingType: "gyms" | "trainers" | "events" | "success_stories",
  filters: GAEventParams
): void {
  trackGAEvent(GA_EVENTS.filter_used, {
    listing_type: listingType,
    ...filters,
  });
}

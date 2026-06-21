import { CITIES, type City, SITE_NAME } from "@/lib/constants";
import { eventTypeLabel } from "@/lib/event-constants";
import type { EventType } from "@prisma/client";
import type { Metadata } from "next";

export const EVENT_CITY_SLUG_MAP: Record<string, City> = {
  rawalpindi: "Rawalpindi",
  islamabad: "Islamabad",
};

export const EVENT_CITY_SEO: Record<City, { title: string; description: string }> = {
  Rawalpindi: {
    title: "Fitness & Fighting Events in Rawalpindi",
    description:
      "Discover upcoming and past boxing, MMA, fitness, and martial arts events in Rawalpindi. Competitions, seminars, and gym-hosted events.",
  },
  Islamabad: {
    title: "Fitness & Fighting Events in Islamabad",
    description:
      "Discover upcoming and past boxing, MMA, fitness, and martial arts events in Islamabad. Competitions, seminars, and gym-hosted events.",
  },
};

export function cityFromEventSlug(slug: string): City | null {
  return EVENT_CITY_SLUG_MAP[slug.toLowerCase()] ?? null;
}

export function eventCitySlug(city: City): string {
  return city.toLowerCase();
}

export function getEventsBasePath(opts?: { city?: City; time?: "upcoming" | "past"; type?: EventType; featured?: boolean }) {
  const base = opts?.city ? `/events/${eventCitySlug(opts.city)}` : "/events";
  const params = new URLSearchParams();
  if (opts?.time === "past") params.set("time", "past");
  if (opts?.type) params.set("type", opts.type);
  if (opts?.featured) params.set("featured", "1");
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function getEventDetailPath(slug: string): string {
  return `/event/${slug}`;
}

export function generateEventsListingMetadata(opts?: {
  city?: City;
  type?: EventType;
  time?: "upcoming" | "past";
}): Metadata {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const citySeo = opts?.city ? EVENT_CITY_SEO[opts.city] : null;
  const typeLabel = opts?.type ? eventTypeLabel(opts.type) : null;
  const timeLabel = opts?.time === "past" ? "Past" : "Upcoming";

  let title = `${timeLabel} Fitness & Fighting Events | ${SITE_NAME}`;
  let description =
    "Discover upcoming and past boxing, MMA, fitness, and martial arts events across Pakistan's top gym and fighting club platform.";

  if (citySeo && typeLabel) {
    title = `${timeLabel} ${typeLabel} Events in ${opts!.city} | ${SITE_NAME}`;
    description = `${timeLabel} ${typeLabel.toLowerCase()} events in ${opts!.city}. ${citySeo.description}`;
  } else if (citySeo) {
    title = `${timeLabel} ${citySeo.title} | ${SITE_NAME}`;
    description = citySeo.description;
  } else if (typeLabel) {
    title = `${timeLabel} ${typeLabel} Events | ${SITE_NAME}`;
    description = `Browse ${timeLabel.toLowerCase()} ${typeLabel.toLowerCase()} events — competitions, seminars, and gym-hosted experiences.`;
  }

  const path = getEventsBasePath({
    city: opts?.city,
    time: opts?.time,
    type: opts?.type,
  });

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    alternates: { canonical: `${base}${path}` },
  };
}

export function generateEventDetailMetadata(event: {
  title: string;
  slug: string;
  city: string;
  type: EventType;
  description: string | null;
  image: string | null;
}): Metadata {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const typeLabel = eventTypeLabel(event.type);
  const title = `${event.title} — ${typeLabel} Event in ${event.city} | ${SITE_NAME}`;
  const description =
    event.description?.slice(0, 160) ??
    `Join ${event.title}, a ${typeLabel.toLowerCase()} event in ${event.city}. View details, location, and contact the host on ${SITE_NAME}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: event.image ? [{ url: event.image }] : undefined,
    },
    alternates: { canonical: `${base}/event/${event.slug}` },
  };
}

export const EVENT_CITY_SLUGS = Object.keys(EVENT_CITY_SLUG_MAP);

export function isEventCitySlug(slug: string): boolean {
  return slug.toLowerCase() in EVENT_CITY_SLUG_MAP;
}

export { CITIES };

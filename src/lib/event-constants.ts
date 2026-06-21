import type { EventType } from "@prisma/client";

export type EventTimeFilter = "upcoming" | "past";
export type EventTimeOfDay = "day" | "night";

export const EVENT_TIME_OF_DAY_OPTIONS: { value: EventTimeOfDay; label: string }[] = [
  { value: "day", label: "Day (6 AM – 6 PM)" },
  { value: "night", label: "Night (6 PM – 6 AM)" },
];

export const EVENT_TIME_OF_DAY_LABELS: Record<EventTimeOfDay, string> = {
  day: "Day",
  night: "Night",
};

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "boxing", label: "Boxing" },
  { value: "mma", label: "MMA" },
  { value: "muay_thai", label: "Muay Thai" },
  { value: "fitness", label: "Fitness" },
  { value: "crossfit", label: "CrossFit" },
  { value: "sparring", label: "Sparring" },
  { value: "competition", label: "Competition" },
  { value: "seminar", label: "Seminar" },
  { value: "other", label: "Other" },
];

export const EVENT_TYPE_LABELS: Record<EventType, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.label])
) as Record<EventType, string>;

export function eventTypeLabel(type: EventType): string {
  return EVENT_TYPE_LABELS[type] ?? type;
}

export const EVENTS_PAGE_SIZE = 12;

export const EVENT_STATUS_LABELS = {
  upcoming: "Upcoming",
  live: "Live Now",
  past: "Past",
} as const;

export const EVENT_STATUS_STYLES = {
  upcoming: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  live: "bg-[#FF6A3D]/10 text-[#FF6A3D] border-[#FF6A3D]/30",
  past: "bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)]",
} as const;

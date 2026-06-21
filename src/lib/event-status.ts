export type EventStatus = "upcoming" | "live" | "past";

/** Effective end for status: endDate if set, otherwise startDate (single-day events). */
export function getEffectiveEndDate(startDate: Date, endDate: Date | null | undefined): Date {
  return endDate ?? startDate;
}

export function getEventStatus(
  startDate: Date,
  endDate: Date | null | undefined,
  now: Date = new Date()
): EventStatus {
  const start = startDate.getTime();
  const end = getEffectiveEndDate(startDate, endDate).getTime();
  const t = now.getTime();

  if (t < start) return "upcoming";
  if (t <= end) return "live";
  return "past";
}

export function isEventUpcoming(startDate: Date, now: Date = new Date()): boolean {
  return startDate.getTime() > now.getTime();
}

export function isEventPast(
  startDate: Date,
  endDate: Date | null | undefined,
  now: Date = new Date()
): boolean {
  return getEffectiveEndDate(startDate, endDate).getTime() < now.getTime();
}

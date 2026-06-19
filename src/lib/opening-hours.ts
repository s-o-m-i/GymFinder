export const WEEKDAYS = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
] as const;

export type WeekdayValue = (typeof WEEKDAYS)[number]["value"];

const DAY_ORDER: WeekdayValue[] = WEEKDAYS.map((d) => d.value);

const DAY_ALIASES: Record<string, WeekdayValue> = {
  mon: "mon",
  monday: "mon",
  tue: "tue",
  tues: "tue",
  tuesday: "tue",
  wed: "wed",
  wednesday: "wed",
  thu: "thu",
  thur: "thu",
  thurs: "thu",
  thursday: "thu",
  fri: "fri",
  friday: "fri",
  sat: "sat",
  saturday: "sat",
  sun: "sun",
  sunday: "sun",
};

export interface OpeningHoursInput {
  days: WeekdayValue[];
  openTime: string;
  closeTime: string;
}

export function formatTime24To12(time24: string): string {
  const [hourPart, minutePart = "00"] = time24.split(":");
  const hour = Number(hourPart);
  const minute = minutePart.padStart(2, "0");
  if (Number.isNaN(hour)) return time24;

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

export function parseTime12To24(time12: string): string {
  const match = time12
    .trim()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return "";

  let hour = Number(match[1]);
  const minute = match[2] ?? "00";
  const period = match[3].toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function normalizeDayToken(token: string): WeekdayValue | null {
  const key = token.trim().toLowerCase().replace(/\./g, "");
  return DAY_ALIASES[key] ?? null;
}

function expandDayRange(start: WeekdayValue, end: WeekdayValue): WeekdayValue[] {
  const startIdx = DAY_ORDER.indexOf(start);
  const endIdx = DAY_ORDER.indexOf(end);
  if (startIdx === -1 || endIdx === -1) return [];

  if (startIdx <= endIdx) {
    return DAY_ORDER.slice(startIdx, endIdx + 1);
  }

  return [...DAY_ORDER.slice(startIdx), ...DAY_ORDER.slice(0, endIdx + 1)];
}

export function parseDaySelection(text: string): WeekdayValue[] {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return [];

  if (normalized === "daily" || normalized === "mon–sun" || normalized === "mon-sun") {
    return [...DAY_ORDER];
  }

  const selected = new Set<WeekdayValue>();

  for (const segment of normalized.split(/,\s*/)) {
    const rangeMatch = segment.match(
      /^([a-z]+)[–-]([a-z]+)$/i
    );
    if (rangeMatch) {
      const start = normalizeDayToken(rangeMatch[1]);
      const end = normalizeDayToken(rangeMatch[2]);
      if (start && end) {
        expandDayRange(start, end).forEach((day) => selected.add(day));
      }
      continue;
    }

    const day = normalizeDayToken(segment);
    if (day) selected.add(day);
  }

  return DAY_ORDER.filter((day) => selected.has(day));
}

function formatDaySelection(days: WeekdayValue[]): string {
  if (days.length === 0) return "";
  if (days.length === 7) return "Daily";

  const indices = days
    .map((day) => DAY_ORDER.indexOf(day))
    .filter((idx) => idx >= 0)
    .sort((a, b) => a - b);

  const ranges: string[] = [];
  let rangeStart = indices[0];
  let rangeEnd = indices[0];

  for (let i = 1; i < indices.length; i++) {
    const current = indices[i];
    if (current === rangeEnd + 1) {
      rangeEnd = current;
      continue;
    }

    ranges.push(formatDayRange(rangeStart, rangeEnd));
    rangeStart = current;
    rangeEnd = current;
  }

  ranges.push(formatDayRange(rangeStart, rangeEnd));
  return ranges.join(", ");
}

function formatDayRange(startIdx: number, endIdx: number): string {
  const startLabel = WEEKDAYS[startIdx]?.label ?? "";
  const endLabel = WEEKDAYS[endIdx]?.label ?? "";
  if (startIdx === endIdx) return startLabel;
  return `${startLabel}–${endLabel}`;
}

export function formatOpeningHours({
  days,
  openTime,
  closeTime,
}: OpeningHoursInput): string {
  if (!days.length || !openTime || !closeTime) return "";

  const dayLabel = formatDaySelection(days);
  const openLabel = formatTime24To12(openTime);
  const closeLabel = formatTime24To12(closeTime);
  return `${dayLabel} · ${openLabel} – ${closeLabel}`;
}

function parseTimeRange(text: string): { openTime: string; closeTime: string } | null {
  const match = text.match(
    /(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*[–-]\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i
  );
  if (!match) return null;

  const openTime = parseTime12To24(match[1]);
  const closeTime = parseTime12To24(match[2]);
  if (!openTime || !closeTime) return null;

  return { openTime, closeTime };
}

export function parseOpeningHours(value?: string | null): OpeningHoursInput {
  const empty: OpeningHoursInput = { days: [], openTime: "", closeTime: "" };
  if (!value?.trim()) return empty;

  const normalized = value.trim();

  if (normalized.includes("·")) {
    const [dayPart, timePart] = normalized.split("·").map((part) => part.trim());
    const times = parseTimeRange(timePart);
    if (!times) return empty;
    return {
      days: parseDaySelection(dayPart),
      openTime: times.openTime,
      closeTime: times.closeTime,
    };
  }

  const legacyMatch = normalized.match(
    /^(.+?)\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*[–-]\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i
  );
  if (!legacyMatch) return empty;

  const openTime = parseTime12To24(legacyMatch[2]);
  const closeTime = parseTime12To24(legacyMatch[3]);
  if (!openTime || !closeTime) return empty;

  return {
    days: parseDaySelection(legacyMatch[1]),
    openTime,
    closeTime,
  };
}

export function time24ToDate(time24: string): Date | null {
  if (!time24) return null;
  const [hourPart, minutePart = "00"] = time24.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function dateToTime24(date: Date | null): string {
  if (!date) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function splitTime24(time24: string): {
  hour12: number;
  minute: number;
  period: "AM" | "PM";
} | null {
  if (!time24) return null;
  const [hourPart, minutePart = "00"] = time24.split(":");
  const hour24 = Number(hourPart);
  const minute = Number(minutePart);
  if (Number.isNaN(hour24) || Number.isNaN(minute)) return null;

  const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, minute, period };
}

export function buildTime24(
  hour12: number,
  minute: number,
  period: "AM" | "PM"
): string {
  let hour24 = hour12 % 12;
  if (period === "PM") hour24 += 12;
  if (period === "AM" && hour12 === 12) hour24 = 0;
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
export const MINUTES_60 = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);

import {
  WEEKDAYS,
  formatTime24To12,
  type WeekdayValue,
} from "@/lib/opening-hours";

export const TRAINER_AVAILABILITY_MAX_SLOTS = 8;

export type TrainerAvailabilitySlot = {
  id: string;
  days: WeekdayValue[];
  startTime: string;
  endTime: string;
};

function isAvailabilitySlot(value: unknown): value is TrainerAvailabilitySlot {
  if (!value || typeof value !== "object") return false;
  const slot = value as TrainerAvailabilitySlot;
  return (
    typeof slot.id === "string" &&
    Array.isArray(slot.days) &&
    typeof slot.startTime === "string" &&
    typeof slot.endTime === "string"
  );
}

export function parseTrainerAvailability(
  raw: string | null | undefined
): TrainerAvailabilitySlot[] {
  if (!raw?.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(isAvailabilitySlot).map((slot) => ({
        id: slot.id,
        days: slot.days.filter((d): d is WeekdayValue =>
          WEEKDAYS.some((w) => w.value === d)
        ),
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));
    }
  } catch {
    // legacy plain text — not editable as slots
  }

  return [];
}

export function serializeTrainerAvailability(
  slots: TrainerAvailabilitySlot[]
): string | null {
  const valid = slots.filter(
    (slot) => slot.days.length > 0 && slot.startTime && slot.endTime
  );
  if (valid.length === 0) return null;
  return JSON.stringify(valid);
}

function formatDays(days: WeekdayValue[]): string {
  if (days.length === 0) return "";
  const labels = WEEKDAYS.filter((d) => days.includes(d.value)).map((d) => d.label);
  if (labels.length === 7) return "Every day";
  if (labels.length === 5 && !days.includes("sat") && !days.includes("sun")) {
    return "Mon–Fri";
  }
  return labels.join(", ");
}

export function formatAvailabilitySlot(slot: TrainerAvailabilitySlot): string {
  const days = formatDays(slot.days);
  const start = formatTime24To12(slot.startTime);
  const end = formatTime24To12(slot.endTime);
  if (!days || !start || !end) return "";
  return `${days}: ${start} – ${end}`;
}

export function formatTrainerAvailability(slots: TrainerAvailabilitySlot[]): string {
  return slots
    .map(formatAvailabilitySlot)
    .filter(Boolean)
    .join(" · ");
}

export function timeStringToDate(time24: string): Date | null {
  if (!time24 || !/^\d{2}:\d{2}$/.test(time24)) return null;
  const [hour, minute] = time24.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function dateToTimeString(date: Date | null): string {
  if (!date) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

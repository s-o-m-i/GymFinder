"use client";

import { useEffect, useState } from "react";
import { GenericTimePicker } from "@/components/admin/GenericTimePicker";
import {
  WEEKDAYS,
  formatOpeningHours,
  parseOpeningHours,
  type WeekdayValue,
} from "@/lib/opening-hours";

export interface ScheduleFieldsProps {
  value: string;
  onChange: (value: string) => void;
  labelClass: string;
  inputClass: string;
  daysLabel?: string;
  openLabel?: string;
  closeLabel?: string;
  emptyHint?: string;
  previewPrefix?: string;
}

export function ScheduleFields({
  value,
  onChange,
  labelClass,
  inputClass,
  daysLabel = "Opening Days",
  openLabel = "Opens at",
  closeLabel = "Closes at",
  emptyHint = "Optional — pick days and times to show on your public listing.",
  previewPrefix = "Saved as",
}: ScheduleFieldsProps) {
  const [days, setDays] = useState<WeekdayValue[]>([]);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");

  useEffect(() => {
    const parsed = parseOpeningHours(value);
    setDays(parsed.days);
    setOpenTime(parsed.openTime);
    setCloseTime(parsed.closeTime);
  }, [value]);

  const syncValue = (
    nextDays: WeekdayValue[],
    nextOpenTime: string,
    nextCloseTime: string
  ) => {
    onChange(
      formatOpeningHours({
        days: nextDays,
        openTime: nextOpenTime,
        closeTime: nextCloseTime,
      })
    );
  };

  const toggleDay = (day: WeekdayValue) => {
    const nextDays = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day];
    const ordered = WEEKDAYS.map((d) => d.value).filter((d) =>
      nextDays.includes(d)
    );
    setDays(ordered);
    syncValue(ordered, openTime, closeTime);
  };

  const selectAllDays = () => {
    const allDays = WEEKDAYS.map((d) => d.value);
    setDays(allDays);
    syncValue(allDays, openTime, closeTime);
  };

  const clearDays = () => {
    setDays([]);
    syncValue([], openTime, closeTime);
  };

  const preview = formatOpeningHours({ days, openTime, closeTime });

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{daysLabel}</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`px-3 py-2 text-sm font-medium rounded-xl border transition-colors ${
                days.includes(day.value)
                  ? "bg-[#0B2545] text-white border-[#0B2545]"
                  : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <button
            type="button"
            onClick={selectAllDays}
            className="text-[#FF6A3D] hover:underline font-medium"
          >
            Select all days
          </button>
          <button
            type="button"
            onClick={clearDays}
            className="text-[var(--text-muted)] hover:text-[var(--text)] hover:underline"
          >
            Clear days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{openLabel}</label>
          <GenericTimePicker
            value={openTime}
            onChange={(nextOpenTime) => {
              setOpenTime(nextOpenTime);
              syncValue(days, nextOpenTime, closeTime);
            }}
            inputClass={inputClass}
            placeholder="Select opening time"
          />
        </div>
        <div>
          <label className={labelClass}>{closeLabel}</label>
          <GenericTimePicker
            value={closeTime}
            onChange={(nextCloseTime) => {
              setCloseTime(nextCloseTime);
              syncValue(days, openTime, nextCloseTime);
            }}
            inputClass={inputClass}
            placeholder="Select closing time"
          />
        </div>
      </div>

      {preview ? (
        <p className="text-xs text-[var(--text-muted)]">
          {previewPrefix}:{" "}
          <span className="font-medium text-[var(--text)]">{preview}</span>
        </p>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">{emptyHint}</p>
      )}
    </div>
  );
}

/** General facility opening hours. */
export function OpeningHoursFields(props: ScheduleFieldsProps) {
  return <ScheduleFields {...props} />;
}

/** Dedicated ladies-only hours schedule. */
export function LadiesOnlyHoursFields(props: ScheduleFieldsProps) {
  return (
    <ScheduleFields
      {...props}
      daysLabel="Ladies-Only Days"
      openLabel="Ladies session starts"
      closeLabel="Ladies session ends"
      emptyHint="Set the dedicated women's-only training schedule shown to members."
      previewPrefix="Ladies-only hours"
    />
  );
}

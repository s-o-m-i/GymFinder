"use client";

import {
  HOURS_12,
  MINUTES_60,
  buildTime24,
  formatTime24To12,
  splitTime24,
} from "@/lib/opening-hours";

interface GenericTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  placeholder?: string;
}

export function GenericTimePicker({
  value,
  onChange,
  inputClass,
  placeholder = "Select time",
}: GenericTimePickerProps) {
  const parts = splitTime24(value);
  const hour12 = parts?.hour12 ?? 12;
  const minute = parts ? String(parts.minute).padStart(2, "0") : "00";
  const period = parts?.period ?? "AM";

  const updateTime = (
    nextHour12: number,
    nextMinute: string,
    nextPeriod: "AM" | "PM"
  ) => {
    onChange(buildTime24(nextHour12, Number(nextMinute), nextPeriod));
  };

  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">
            Hour
          </label>
          <select
            value={hour12}
            onChange={(e) =>
              updateTime(Number(e.target.value), minute, period)
            }
            className={selectClass}
            aria-label="Hour"
          >
            {HOURS_12.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">
            Minute
          </label>
          <select
            value={minute}
            onChange={(e) => updateTime(hour12, e.target.value, period)}
            className={selectClass}
            aria-label="Minute"
          >
            {MINUTES_60.map((min) => (
              <option key={min} value={min}>
                {min}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">
            AM / PM
          </label>
          <select
            value={period}
            onChange={(e) =>
              updateTime(hour12, minute, e.target.value as "AM" | "PM")
            }
            className={selectClass}
            aria-label="AM or PM"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      <p className="text-[11px] text-[var(--text-muted)]">
        {value ? (
          <>
            Selected:{" "}
            <span className="font-medium text-[var(--text)]">
              {formatTime24To12(value)}
            </span>
          </>
        ) : (
          placeholder
        )}
      </p>
    </div>
  );
}

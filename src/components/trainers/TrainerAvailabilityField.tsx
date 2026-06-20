"use client";

import DatePicker from "react-datepicker";
import { Plus, X, Clock } from "lucide-react";
import {
  TRAINER_AVAILABILITY_MAX_SLOTS,
  dateToTimeString,
  timeStringToDate,
  type TrainerAvailabilitySlot,
} from "@/lib/trainer-availability";
import { WEEKDAYS, type WeekdayValue } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";

interface TrainerAvailabilityFieldProps {
  slots: TrainerAvailabilitySlot[];
  onChange: (slots: TrainerAvailabilitySlot[]) => void;
  error?: string;
}

const inputClass =
  "w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]";

export function TrainerAvailabilityField({
  slots,
  onChange,
  error,
}: TrainerAvailabilityFieldProps) {
  function updateSlot(id: string, patch: Partial<TrainerAvailabilitySlot>) {
    onChange(slots.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)));
  }

  function toggleDay(slotId: string, day: WeekdayValue) {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;
    const nextDays = slot.days.includes(day)
      ? slot.days.filter((d) => d !== day)
      : [...slot.days, day];
    const ordered = WEEKDAYS.map((d) => d.value).filter((d) => nextDays.includes(d));
    updateSlot(slotId, { days: ordered });
  }

  function addSlot() {
    if (slots.length >= TRAINER_AVAILABILITY_MAX_SLOTS) return;
    onChange([
      ...slots,
      {
        id: crypto.randomUUID(),
        days: [],
        startTime: "09:00",
        endTime: "17:00",
      },
    ]);
  }

  function removeSlot(id: string) {
    onChange(slots.filter((slot) => slot.id !== id));
  }

  return (
    <div className="sm:col-span-2 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Availability slots{" "}
          <span className="font-normal text-gray-500">
            (max {TRAINER_AVAILABILITY_MAX_SLOTS} · pick days and times for each slot)
          </span>
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Add when you are available for training sessions. Clients will see these on your public
          profile.
        </p>
      </div>

      {slots.length === 0 && (
        <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-4">
          No availability slots yet. Add your first slot below.
        </p>
      )}

      <ul className="space-y-4">
        {slots.map((slot, index) => (
          <li
            key={slot.id}
            className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF6A3D]" />
                Slot {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeSlot(slot.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                aria-label="Remove slot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Days
              </p>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(slot.id, day.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer",
                      slot.days.includes(day.value)
                        ? "bg-[#0B2545] text-white border-[#0B2545]"
                        : "bg-white border-gray-200 text-gray-600 hover:border-[#FF6A3D]/40"
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Starts
                </p>
                <DatePicker
                  selected={timeStringToDate(slot.startTime)}
                  onChange={(date: Date | null) =>
                    updateSlot(slot.id, { startTime: dateToTimeString(date) })
                  }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Start"
                  dateFormat="h:mm aa"
                  className={inputClass}
                  calendarClassName="gymfinder-datepicker"
                  popperClassName="gymfinder-datepicker-popper"
                  placeholderText="Start time"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Ends
                </p>
                <DatePicker
                  selected={timeStringToDate(slot.endTime)}
                  onChange={(date: Date | null) =>
                    updateSlot(slot.id, { endTime: dateToTimeString(date) })
                  }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="End"
                  dateFormat="h:mm aa"
                  className={inputClass}
                  calendarClassName="gymfinder-datepicker"
                  popperClassName="gymfinder-datepicker-popper"
                  placeholderText="End time"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={addSlot}
        disabled={slots.length >= TRAINER_AVAILABILITY_MAX_SLOTS}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0B2545] text-white text-sm font-semibold rounded-xl hover:bg-[#071832] transition-colors disabled:opacity-50 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add availability slot
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

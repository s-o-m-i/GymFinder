"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { OpeningHoursFields, LadiesOnlyHoursFields } from "@/components/admin/OpeningHoursFields";
import { CustomTagPicker } from "@/components/admin/CustomTagPicker";
import { Button } from "@/components/ui/Button";
import { LADIES_STATUS_OPTIONS } from "@/lib/constants";
import type { LadiesStatus } from "@prisma/client";
import type { GymCommonSettingsInput } from "@/lib/validations/gym-common";

const inputClass =
  "w-full px-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]";
const labelClass =
  "block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5";

type TagOption = { id: string; name: string };

type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export type GymCommonSettingsFormState = {
  openingHours: string;
  ladiesHours: string;
  ladiesStatus: LadiesStatus;
  disciplineIds: string[];
  customDisciplineNames: string[];
  amenityIds: string[];
  customAmenityNames: string[];
};

interface GymCommonSettingsFormProps {
  initialData: GymCommonSettingsFormState;
  disciplines: TagOption[];
  amenities: TagOption[];
  membershipsHref: string;
  equipmentHref?: string;
  onSubmit: (input: GymCommonSettingsInput) => Promise<ActionResult>;
}

export function GymCommonSettingsForm({
  initialData,
  disciplines,
  amenities,
  membershipsHref,
  equipmentHref,
  onSubmit,
}: GymCommonSettingsFormProps) {
  const [form, setForm] = useState(initialData);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const set = <K extends keyof GymCommonSettingsFormState>(
    key: K,
    value: GymCommonSettingsFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setSaved(false);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await onSubmit({
        openingHours: form.openingHours,
        ladiesHours: form.ladiesHours,
        ladiesStatus: form.ladiesStatus,
        disciplines: form.disciplineIds,
        customDisciplines: form.customDisciplineNames,
        amenities: form.amenityIds,
        customAmenities: form.customAmenityNames,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
          Common settings saved. Branches that use brand defaults will show these values.
        </div>
      )}

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h3 className="font-heading font-bold text-[var(--text)] mb-2">How this works</h3>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          These brand defaults apply to every branch unless that branch turns off
          “Use common” for hours, disciplines, or amenities. Memberships, team,
          FAQs, equipment, and transformations stay shared across all branches.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            href={membershipsHref}
            className="px-3 py-1.5 text-xs font-semibold border border-[var(--border)] rounded-lg hover:bg-[var(--bg)]"
          >
            Edit memberships
          </Link>
          {equipmentHref && (
            <Link
              href={equipmentHref}
              className="px-3 py-1.5 text-xs font-semibold border border-[var(--border)] rounded-lg hover:bg-[var(--bg)]"
            >
              Edit equipment
            </Link>
          )}
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h3 className="font-heading font-bold text-[var(--text)] mb-5">Common hours</h3>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Ladies access</label>
            <select
              value={form.ladiesStatus}
              onChange={(e) => set("ladiesStatus", e.target.value as LadiesStatus)}
              className={inputClass}
            >
              {LADIES_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <OpeningHoursFields
            value={form.openingHours}
            onChange={(value) => set("openingHours", value)}
            labelClass={labelClass}
            inputClass={inputClass}
          />
          {form.ladiesStatus === "ladies_timings" && (
            <LadiesOnlyHoursFields
              value={form.ladiesHours}
              onChange={(value) => set("ladiesHours", value)}
              labelClass={labelClass}
              inputClass={inputClass}
            />
          )}
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h3 className="font-heading font-bold text-[var(--text)] mb-5">
          Common disciplines
        </h3>
        <CustomTagPicker
          predefined={disciplines}
          selectedIds={form.disciplineIds}
          customNames={form.customDisciplineNames}
          onSelectedIdsChange={(ids) => set("disciplineIds", ids)}
          onCustomNamesChange={(names) => set("customDisciplineNames", names)}
          customLabel="Add Custom Discipline"
          customPlaceholder="e.g. Sambo, Capoeira"
          customHint="These show on every branch unless a branch overrides them."
          inputClass={inputClass}
          labelClass={labelClass}
        />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h3 className="font-heading font-bold text-[var(--text)] mb-5">
          Common amenities & facilities
        </h3>
        <CustomTagPicker
          predefined={amenities}
          selectedIds={form.amenityIds}
          customNames={form.customAmenityNames}
          onSelectedIdsChange={(ids) => set("amenityIds", ids)}
          onCustomNamesChange={(names) => set("customAmenityNames", names)}
          customLabel="Add Custom Amenity"
          customPlaceholder="e.g. Steam Room, Parking"
          customHint="These show on every branch unless a branch overrides them."
          inputClass={inputClass}
          labelClass={labelClass}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save common settings"}
        </Button>
      </div>
    </form>
  );
}

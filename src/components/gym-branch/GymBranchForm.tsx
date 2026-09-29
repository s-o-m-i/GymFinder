"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OpeningHoursFields, LadiesOnlyHoursFields } from "@/components/admin/OpeningHoursFields";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";
import { CITIES, getAreasForCity } from "@/lib/constants";
import {
  GYM_BRANCH_STATUSES,
  gymBranchStatusLabel,
  type GymBranchStatusValue,
} from "@/lib/gym-branch-rules";
import type { GymBranchFormInput } from "@/lib/validations/gym-branch";

export type GymBranchFormState = {
  name: string;
  slug: string;
  address: string;
  area: string;
  city: string;
  latitude: string;
  longitude: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  openingHours: string;
  ladiesHours: string;
  status: GymBranchStatusValue;
  isPrimary: boolean;
};

export const EMPTY_BRANCH_FORM: GymBranchFormState = {
  name: "",
  slug: "",
  address: "",
  area: "",
  city: "Islamabad",
  latitude: "",
  longitude: "",
  phone: "",
  whatsappNumber: "",
  email: "",
  openingHours: "",
  ladiesHours: "",
  status: "ACTIVE",
  isPrimary: false,
};

export function branchToForm(branch: {
  name: string;
  slug: string;
  address: string;
  area: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  openingHours?: string | null;
  ladiesHours?: string | null;
  status: GymBranchStatusValue;
  isPrimary: boolean;
}): GymBranchFormState {
  return {
    name: branch.name,
    slug: branch.slug,
    address: branch.address,
    area: branch.area,
    city: branch.city,
    latitude: branch.latitude?.toString() ?? "",
    longitude: branch.longitude?.toString() ?? "",
    phone: branch.phone ?? "",
    whatsappNumber: branch.whatsappNumber ?? "",
    email: branch.email ?? "",
    openingHours: branch.openingHours ?? "",
    ladiesHours: branch.ladiesHours ?? "",
    status: branch.status,
    isPrimary: branch.isPrimary,
  };
}

type ActionResult =
  | { success: true; data?: { id: string; slug: string } }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

interface GymBranchFormProps {
  mode: "create" | "edit";
  initialData?: GymBranchFormState;
  gymName: string;
  cancelHref: string;
  successHref: string;
  onSubmit: (input: GymBranchFormInput) => Promise<ActionResult>;
}

const inputClass =
  "w-full px-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]";
const labelClass =
  "block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
      <h3 className="font-heading font-bold text-[var(--text)] mb-5">{title}</h3>
      {children}
    </div>
  );
}

export function GymBranchForm({
  mode,
  initialData,
  gymName,
  cancelHref,
  successHref,
  onSubmit,
}: GymBranchFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<GymBranchFormState>(initialData ?? EMPTY_BRANCH_FORM);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const areas = getAreasForCity(form.city);
  const areaQuickPickValue = areas.includes(form.area) ? form.area : "";

  const set = <K extends keyof GymBranchFormState>(key: K, value: GymBranchFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await onSubmit({
        name: form.name,
        slug: form.slug || undefined,
        address: form.address,
        area: form.area,
        city: form.city,
        latitude: form.latitude,
        longitude: form.longitude,
        phone: form.phone,
        whatsappNumber: form.whatsappNumber,
        email: form.email,
        openingHours: form.openingHours,
        ladiesHours: form.ladiesHours,
        status: form.status,
        isPrimary: form.isPrimary || (initialData?.isPrimary ?? false),
      });

      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      router.push(successHref);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <SectionCard title="Branch details">
        <p className="text-sm text-[var(--text-muted)] mb-5">
          This location belongs to <span className="font-semibold text-[var(--text)]">{gymName}</span>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Branch Name *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  name,
                  slug: mode === "create" ? slugify(name) : prev.slug,
                }));
              }}
              placeholder="e.g. BodyTech EME"
              className={inputClass}
            />
            {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Slug (URL)</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              placeholder="auto-generated if empty"
              className={inputClass}
            />
            {fieldErrors.slug && <p className="text-xs text-red-600 mt-1">{fieldErrors.slug}</p>}
          </div>
          <div>
            <label className={labelClass}>Status *</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as GymBranchStatusValue)}
              className={inputClass}
            >
              {GYM_BRANCH_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {gymBranchStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Location">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>City *</label>
            <select
              required
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className={inputClass}
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {fieldErrors.city && <p className="text-xs text-red-600 mt-1">{fieldErrors.city}</p>}
          </div>
          <div>
            <label className={labelClass}>Area *</label>
            {areas.length > 0 && (
              <select
                value={areaQuickPickValue}
                onChange={(e) => set("area", e.target.value)}
                className={`${inputClass} mb-2`}
              >
                <option value="">Quick pick (optional)</option>
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            )}
            <input
              required
              type="text"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              placeholder="e.g. DHA Phase XII"
              className={inputClass}
            />
            {fieldErrors.area && <p className="text-xs text-red-600 mt-1">{fieldErrors.area}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Address *</label>
            <input
              required
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Street address"
              className={inputClass}
            />
            {fieldErrors.address && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.address}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Latitude</label>
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => set("latitude", e.target.value)}
              placeholder="33.6844"
              className={inputClass}
            />
            {fieldErrors.latitude && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.latitude}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Longitude</label>
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => set("longitude", e.target.value)}
              placeholder="73.0479"
              className={inputClass}
            />
            {fieldErrors.longitude && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.longitude}</p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Contact">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="03001234567"
              className={inputClass}
            />
            {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
          </div>
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input
              type="text"
              value={form.whatsappNumber}
              onChange={(e) => set("whatsappNumber", e.target.value)}
              placeholder="03001234567"
              className={inputClass}
            />
            {fieldErrors.whatsappNumber && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.whatsappNumber}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="branch@example.com"
              className={inputClass}
            />
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Opening hours">
        <div className="space-y-5">
          <OpeningHoursFields
            value={form.openingHours}
            onChange={(value) => set("openingHours", value)}
            labelClass={labelClass}
            inputClass={inputClass}
          />
          <LadiesOnlyHoursFields
            value={form.ladiesHours}
            onChange={(value) => set("ladiesHours", value)}
            labelClass={labelClass}
            inputClass={inputClass}
          />
        </div>
      </SectionCard>

      <SectionCard title="Primary location">
        <label className="flex items-start gap-3 text-sm text-[var(--text)]">
          <input
            type="checkbox"
            checked={form.isPrimary}
            disabled={initialData?.isPrimary}
            onChange={(e) => set("isPrimary", e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="font-semibold">Set as primary location</span>
            <span className="block text-[var(--text-muted)] text-xs mt-1">
              The gym listing city, area, address, hours and WhatsApp stay in sync with the
              primary branch only. Other branches never overwrite those gym fields.
            </span>
          </span>
        </label>
      </SectionCard>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(cancelHref)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : mode === "create" ? "Add Branch" : "Save Branch"}
        </Button>
      </div>
    </form>
  );
}

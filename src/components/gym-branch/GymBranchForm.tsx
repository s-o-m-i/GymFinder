"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OpeningHoursFields, LadiesOnlyHoursFields } from "@/components/admin/OpeningHoursFields";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { CustomTagPicker } from "@/components/admin/CustomTagPicker";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";
import {
  CITIES,
  getAreasForCity,
  LADIES_STATUS_OPTIONS,
  SIZE_CATEGORIES,
} from "@/lib/constants";
import {
  GYM_BRANCH_STATUSES,
  gymBranchStatusLabel,
  type GymBranchStatusValue,
} from "@/lib/gym-branch-rules";
import type { GymBranchFormInput } from "@/lib/validations/gym-branch";
import Link from "next/link";
import {
  branchToForm,
  EMPTY_BRANCH_FORM,
  type GymBranchFormState,
} from "@/lib/gym-branch-form-state";

export { branchToForm, EMPTY_BRANCH_FORM, type GymBranchFormState };

type ActionResult =
  | { success: true; data?: { id: string; slug: string } }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

type TagOption = { id: string; name: string };

interface GymBranchFormProps {
  mode: "create" | "edit";
  initialData?: GymBranchFormState;
  gymName: string;
  cancelHref: string;
  successHref: string;
  commonSettingsHref?: string;
  imageAuthMode?: "cookie" | "admin-secret";
  disciplines: TagOption[];
  amenities: TagOption[];
  onSubmit: (input: GymBranchFormInput) => Promise<ActionResult>;
}

const inputClass =
  "w-full px-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]";
const labelClass =
  "block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5";

function SectionCard({
  title,
  children,
  hint,
}: {
  title: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
      <h3 className="font-heading font-bold text-[var(--text)] mb-1">{title}</h3>
      {hint ? (
        <p className="text-sm text-[var(--text-muted)] mb-5">{hint}</p>
      ) : (
        <div className="mb-5" />
      )}
      {children}
    </div>
  );
}

function InheritToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 text-sm text-[var(--text)] mb-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1"
      />
      <span>
        <span className="font-semibold">{label}</span>
        <span className="block text-[var(--text-muted)] text-xs mt-1">
          Uncheck to set branch-specific values instead of the brand defaults.
        </span>
      </span>
    </label>
  );
}

export function GymBranchForm({
  mode,
  initialData,
  gymName,
  cancelHref,
  successHref,
  commonSettingsHref,
  imageAuthMode = "cookie",
  disciplines,
  amenities,
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
        description: form.description,
        priceMin: form.priceMin,
        priceMax: form.priceMax,
        ladiesStatus: (form.ladiesStatus || null) as GymBranchFormInput["ladiesStatus"],
        sizeCategory: (form.sizeCategory || null) as GymBranchFormInput["sizeCategory"],
        establishedYear: form.establishedYear,
        memberCount: form.memberCount,
        coachInfo: form.coachInfo,
        equipment: form.equipment,
        transformations: form.transformations,
        useCommonAmenities: form.useCommonAmenities,
        useCommonDisciplines: form.useCommonDisciplines,
        useCommonHours: form.useCommonHours,
        disciplines: form.disciplineIds,
        customDisciplines: form.customDisciplineNames,
        amenities: form.amenityIds,
        customAmenities: form.customAmenityNames,
        coverImage: form.coverImage
          ? { imageUrl: form.coverImage.imageUrl, publicId: form.coverImage.publicId }
          : null,
        galleryImages: form.galleryImages
          .filter((img) => img.status === "uploaded" && img.imageUrl)
          .map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            publicId: img.publicId,
          })),
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

      <SectionCard
        title="Branch details"
        hint={
          <>
            This branch belongs to{" "}
            <span className="font-semibold text-[var(--text)]">{gymName}</span>
            {commonSettingsHref ? (
              <>
                . Shared brand amenities, hours, and memberships are set in{" "}
                <Link href={commonSettingsHref} className="text-[#FF6A3D] font-semibold">
                  Common Settings
                </Link>
                .
              </>
            ) : (
              "."
            )}
          </>
        }
      >
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
          <div className="sm:col-span-2">
            <label className={labelClass}>About this branch</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Leave empty to use the brand description."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Cover & gallery"
        hint="Each branch can have its own photos. Leave empty to reuse the brand cover and gallery."
      >
        <div className="space-y-8">
          <ImageUploader
            label="Cover Image"
            description="Shown on listing cards and the top of this branch page."
            uploadType="cover"
            multiple={false}
            images={form.coverImage ? [form.coverImage] : []}
            onChange={(imgs) => set("coverImage", imgs[0] ?? null)}
            authMode={imageAuthMode}
          />
          <ImageUploader
            label="Gallery Images"
            description="Upload up to 10 photos for this branch."
            uploadType="gallery"
            multiple
            maxImages={10}
            images={form.galleryImages}
            onChange={(imgs) => set("galleryImages", imgs)}
            authMode={imageAuthMode}
          />
        </div>
      </SectionCard>

      <SectionCard title="Address">
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

      <SectionCard
        title="Pricing & listing details"
        hint="Leave prices empty to use the brand membership range on this branch."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Min price (PKR / month)</label>
            <input
              type="number"
              min={0}
              value={form.priceMin}
              onChange={(e) => set("priceMin", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Max price (PKR / month)</label>
            <input
              type="number"
              min={0}
              value={form.priceMax}
              onChange={(e) => set("priceMax", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ladies access</label>
            <select
              value={form.ladiesStatus}
              onChange={(e) => set("ladiesStatus", e.target.value)}
              className={inputClass}
            >
              <option value="">Use common brand setting</option>
              {LADIES_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Size</label>
            <select
              value={form.sizeCategory}
              onChange={(e) => set("sizeCategory", e.target.value)}
              className={inputClass}
            >
              <option value="">Use common brand setting</option>
              {SIZE_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Established year</label>
            <input
              type="number"
              value={form.establishedYear}
              onChange={(e) => set("establishedYear", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Member count</label>
            <input
              type="number"
              min={0}
              value={form.memberCount}
              onChange={(e) => set("memberCount", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Coach information</label>
            <textarea
              rows={3}
              value={form.coachInfo}
              onChange={(e) => set("coachInfo", e.target.value)}
              placeholder="Leave empty to use the brand coach info."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Opening hours">
        <InheritToggle
          checked={form.useCommonHours}
          onChange={(value) => set("useCommonHours", value)}
          label="Use common brand hours"
        />
        {!form.useCommonHours && (
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
        )}
      </SectionCard>

      <SectionCard title="Disciplines">
        <InheritToggle
          checked={form.useCommonDisciplines}
          onChange={(value) => set("useCommonDisciplines", value)}
          label="Use common brand disciplines"
        />
        {!form.useCommonDisciplines && (
          <CustomTagPicker
            predefined={disciplines}
            selectedIds={form.disciplineIds}
            customNames={form.customDisciplineNames}
            onSelectedIdsChange={(ids) => set("disciplineIds", ids)}
            onCustomNamesChange={(names) => set("customDisciplineNames", names)}
            customLabel="Add Custom Discipline"
            customPlaceholder="e.g. Sambo, Capoeira"
            customHint="Type a discipline not listed above and click Add."
            inputClass={inputClass}
            labelClass={labelClass}
          />
        )}
      </SectionCard>

      <SectionCard title="Amenities & facilities">
        <InheritToggle
          checked={form.useCommonAmenities}
          onChange={(value) => set("useCommonAmenities", value)}
          label="Use common brand amenities"
        />
        {!form.useCommonAmenities && (
          <CustomTagPicker
            predefined={amenities}
            selectedIds={form.amenityIds}
            customNames={form.customAmenityNames}
            onSelectedIdsChange={(ids) => set("amenityIds", ids)}
            onCustomNamesChange={(names) => set("customAmenityNames", names)}
            customLabel="Add Custom Amenity"
            customPlaceholder="e.g. Outdoor Training Area"
            customHint="Type a facility not listed above and click Add."
            inputClass={inputClass}
            labelClass={labelClass}
          />
        )}
      </SectionCard>

      <SectionCard
        title="Primary branch"
        hint="The brand listing city, area, address, hours, and WhatsApp stay in sync with the primary branch only."
      >
        <label className="flex items-start gap-3 text-sm text-[var(--text)]">
          <input
            type="checkbox"
            checked={form.isPrimary}
            disabled={initialData?.isPrimary}
            onChange={(e) => set("isPrimary", e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="font-semibold">Set as primary branch</span>
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

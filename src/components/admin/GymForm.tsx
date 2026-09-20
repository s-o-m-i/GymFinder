"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { OpeningHoursFields, LadiesOnlyHoursFields } from "@/components/admin/OpeningHoursFields";
import { CustomTagPicker } from "@/components/admin/CustomTagPicker";
import {
  OwnerGymStepIndicator,
  OWNER_GYM_STEPS,
} from "@/components/owner/OwnerGymStepIndicator";
import { parseOpeningHours } from "@/lib/opening-hours";
import type { UploadedImage } from "@/lib/gym-images-form";
import { buildGymFormImageState } from "@/lib/gym-images-form";
import {
  GYM_TYPES,
  LADIES_STATUS_OPTIONS,
  SIZE_CATEGORIES,
  CITIES,
  getAreasForCity,
  CUSTOM_TYPE_VALUE,
} from "@/lib/constants";
import {
  getOwnerFormCopy,
  getOwnerListingTypes,
  getInitialFormType,
  isDisciplineAllowedForOwner,
  resolveGymTypeForSave,
} from "@/lib/owner-constants";
import type { BusinessCategory } from "@prisma/client";
import type { Discipline, Amenity } from "@prisma/client";
import { GA_EVENTS, trackGAEvent } from "@/lib/google-analytics";

interface GymFormData {
  name: string;
  slug: string;
  type: string;
  customTypeLabel: string;
  description: string;
  address: string;
  area: string;
  city: string;
  latitude: string;
  longitude: string;
  priceMin: string;
  priceMax: string;
  ladiesStatus: string;
  sizeCategory: string;
  establishedYear: string;
  memberCount: string;
  whatsappNumber: string;
  openingHours: string;
  ladiesHours: string;
  coachInfo: string;
  featured: boolean;
  rating: string;
  coverImage: UploadedImage | null;
  galleryImages: UploadedImage[];
  disciplineIds: string[];
  customDisciplineNames: string[];
  amenityIds: string[];
  customAmenityNames: string[];
}

interface GymFormProps {
  initialData?: Partial<GymFormData & { id: string }>;
  disciplines: Discipline[];
  amenities: Amenity[];
  mode: "create" | "edit";
  variant?: "admin" | "owner";
  businessCategory?: BusinessCategory;
  cancelPath?: string;
  successPath?: string;
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "gymfinder-admin-2024";
const ADMIN_CREATE_GALLERY_IMAGE_LIMIT = 20;

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
      <h3 className="font-heading font-bold text-[var(--text)] mb-5">{title}</h3>
      {children}
    </div>
  );
}


export function GymForm({
  initialData,
  disciplines,
  amenities,
  mode,
  variant = "admin",
  businessCategory,
  cancelPath,
  successPath,
}: GymFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isOwnerWizard = variant === "owner";
  const [step, setStep] = useState(1);
  const totalSteps = OWNER_GYM_STEPS.length;

  const showStep = (stepNumber: number) =>
    !isOwnerWizard || step === stepNumber;

  const ownerCopy =
    variant === "owner" && businessCategory
      ? getOwnerFormCopy(businessCategory)
      : null;
  const typeOptions =
    variant === "owner" && businessCategory
      ? getOwnerListingTypes(businessCategory)
      : GYM_TYPES;
  const visibleDisciplines =
    variant === "owner" && businessCategory
      ? disciplines.filter((d) =>
          isDisciplineAllowedForOwner(d.name, businessCategory)
        )
      : disciplines;

  const [form, setForm] = useState<GymFormData>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    type:
      variant === "owner" && businessCategory
        ? getInitialFormType(
            businessCategory,
            initialData?.type,
            initialData?.customTypeLabel
          )
        : getInitialFormType(undefined, initialData?.type, initialData?.customTypeLabel),
    customTypeLabel: initialData?.customTypeLabel ?? "",
    description: initialData?.description ?? "",
    address: initialData?.address ?? "",
    area: initialData?.area ?? "",
    city: initialData?.city ?? "Islamabad",
    latitude: initialData?.latitude ?? "",
    longitude: initialData?.longitude ?? "",
    priceMin: initialData?.priceMin ?? "",
    priceMax: initialData?.priceMax ?? "",
    ladiesStatus: initialData?.ladiesStatus ?? "mixed",
    sizeCategory: initialData?.sizeCategory ?? "medium",
    establishedYear: initialData?.establishedYear ?? "",
    memberCount: initialData?.memberCount ?? "",
    whatsappNumber: initialData?.whatsappNumber ?? "",
    openingHours: initialData?.openingHours ?? "",
    ladiesHours: initialData?.ladiesHours ?? "",
    coachInfo: initialData?.coachInfo ?? "",
    featured: initialData?.featured ?? false,
    rating: initialData?.rating ?? "",
    coverImage: initialData?.coverImage ?? null,
    galleryImages: initialData?.galleryImages ?? [],
    disciplineIds: initialData?.disciplineIds ?? [],
    customDisciplineNames: initialData?.customDisciplineNames ?? [],
    amenityIds: initialData?.amenityIds ?? [],
    customAmenityNames: initialData?.customAmenityNames ?? [],
  });

  useEffect(() => {
    if (variant !== "owner" || mode !== "edit") return;

    let cancelled = false;

    async function hydrateOwnerImages() {
      try {
        const res = await fetch("/api/owner/gym", { credentials: "include" });
        if (!res.ok || cancelled) return;

        const json = await res.json();
        const gym = json.data as {
          coverImage?: string | null;
          coverImagePublicId?: string | null;
          galleryImages?: Array<{
            id: string;
            imageUrl: string;
            publicId?: string | null;
          }>;
        } | null;

        if (!gym || cancelled) return;

        const { coverImage, galleryImages } = buildGymFormImageState(gym);
        setForm((prev) => ({
          ...prev,
          coverImage,
          galleryImages,
        }));
      } catch {
        // Keep server-provided initial values if hydration fails.
      }
    }

    void hydrateOwnerImages();

    return () => {
      cancelled = true;
    };
  }, [variant, mode]);

  const areas = getAreasForCity(form.city);
  const areaQuickPickValue = areas.includes(form.area) ? form.area : "";
  const isCustomType = form.type === CUSTOM_TYPE_VALUE;
  const typeHint =
    ownerCopy?.typeHint ??
    "Pick a category or choose Other to specify your own.";
  const customTypeFieldLabel =
    ownerCopy?.customTypeLabel ?? "Custom type";
  const customTypePlaceholder =
    ownerCopy?.customTypePlaceholder ?? "e.g. CrossFit, Powerlifting Studio";
  const areaHint =
    ownerCopy?.areaHint ??
    "Type any neighbourhood, or use the quick pick if yours is listed.";

  const set = (key: keyof GymFormData, value: GymFormData[keyof GymFormData]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const hasUploadingImages =
    form.coverImage?.status === "uploading" ||
    form.coverImage?.status === "pending" ||
    form.galleryImages.some((img) => img.status === "uploading" || img.status === "pending");

  function validateOwnerStep(stepNumber: number): string | null {
    switch (stepNumber) {
      case 1:
        if (!form.name.trim()) {
          return ownerCopy?.nameRequiredError ?? "Please enter the name.";
        }
        if (isCustomType && !form.customTypeLabel.trim()) {
          return (
            ownerCopy?.customTypeRequiredError ??
            "Please enter your custom type."
          );
        }
        if (!form.description.trim()) return "Please add a description.";
        return null;
      case 2:
        if (!form.area.trim()) return "Please enter an area or neighbourhood.";
        if (!form.address.trim()) return "Please enter your full address.";
        return null;
      case 3:
        if (!form.priceMin || !form.priceMax) {
          return "Please enter both minimum and maximum monthly price.";
        }
        if (Number(form.priceMin) > Number(form.priceMax)) {
          return "Minimum price cannot be higher than maximum price.";
        }
        if (form.ladiesStatus === "ladies_timings") {
          const ladiesSchedule = parseOpeningHours(form.ladiesHours);
          if (
            !ladiesSchedule.days.length ||
            !ladiesSchedule.openTime ||
            !ladiesSchedule.closeTime
          ) {
            return "Please set the full ladies-only hours schedule.";
          }
        }
        return null;
      case 4:
        if (!form.whatsappNumber.trim()) {
          return "Please enter a WhatsApp number for client inquiries.";
        }
        return null;
      default:
        return null;
    }
  }

  const completedOwnerSteps = useMemo(() => {
    if (!isOwnerWizard) return new Set<number>();

    const done = new Set<number>();
    for (let stepNumber = 1; stepNumber <= totalSteps; stepNumber++) {
      if (stepNumber === 6) {
        if (
          form.coverImage?.imageUrl ||
          form.galleryImages.some((img) => img.imageUrl)
        ) {
          done.add(6);
        }
        continue;
      }

      if (validateOwnerStep(stepNumber) === null) {
        done.add(stepNumber);
      }
    }
    return done;
  }, [form, isOwnerWizard, totalSteps, isCustomType, ownerCopy]);

  function goToStep(nextStep: number) {
    setError("");
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    const validationError = validateOwnerStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    goToStep(Math.min(step + 1, totalSteps));
  }

  function goBack() {
    goToStep(Math.max(step - 1, 1));
  }

  async function submitForm() {
    if (saving) return;

    if (hasUploadingImages) {
      setError("Please wait for all images to finish uploading.");
      return;
    }

    if (!isOwnerWizard) {
      if (isCustomType && !form.customTypeLabel.trim()) {
        setError(
          ownerCopy?.customTypeRequiredError ??
            "Please enter your custom type."
        );
        return;
      }
      if (!form.area.trim()) {
        setError("Please enter an area or neighbourhood.");
        return;
      }
      if (form.ladiesStatus === "ladies_timings") {
        const ladiesSchedule = parseOpeningHours(form.ladiesHours);
        if (
          !ladiesSchedule.days.length ||
          !ladiesSchedule.openTime ||
          !ladiesSchedule.closeTime
        ) {
          setError(
            "Please set the full ladies-only hours schedule (days, start time, and end time)."
          );
          return;
        }
      }
    } else {
      for (let i = 1; i <= 4; i++) {
        const validationError = validateOwnerStep(i);
        if (validationError) {
          setError(validationError);
          setStep(i);
          return;
        }
      }
    }

    setSaving(true);
    setError("");

    const coverPayload =
      form.coverImage?.imageUrl &&
      form.coverImage.status !== "uploading" &&
      form.coverImage.status !== "pending"
        ? { imageUrl: form.coverImage.imageUrl, publicId: form.coverImage.publicId }
        : null;

    const galleryPayload = form.galleryImages
      .filter(
        (img) =>
          img.imageUrl &&
          img.status !== "uploading" &&
          img.status !== "pending"
      )
      .map((img) => ({
        id:       img.id,
        imageUrl: img.imageUrl,
        publicId: img.publicId,
      }));

    const { type: resolvedType, customTypeLabel: resolvedCustomTypeLabel } =
      resolveGymTypeForSave(form.type, form.customTypeLabel, businessCategory);

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      type: resolvedType,
      customTypeLabel: resolvedCustomTypeLabel,
      description: form.description,
      address: form.address,
      area: form.area.trim(),
      city: form.city,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      priceMin: parseInt(form.priceMin),
      priceMax: parseInt(form.priceMax),
      ladiesStatus: form.ladiesStatus,
      sizeCategory: form.sizeCategory,
      establishedYear: form.establishedYear ? parseInt(form.establishedYear, 10) : null,
      memberCount: form.memberCount ? parseInt(form.memberCount, 10) : null,
      whatsappNumber: form.whatsappNumber,
      openingHours: form.openingHours || null,
      ladiesHours:
        form.ladiesStatus === "ladies_timings" ? form.ladiesHours || null : null,
      coachInfo: form.coachInfo || null,
      ...(variant === "admin" && {
        featured: form.featured,
        rating: form.rating ? parseFloat(form.rating) : null,
      }),
      disciplines: form.disciplineIds,
      customDisciplines: form.customDisciplineNames,
      amenities: form.amenityIds,
      customAmenities: form.customAmenityNames,
      coverImage: coverPayload,
      galleryImages: galleryPayload,
    };

    try {
      const isOwner = variant === "owner";
      const url = isOwner
        ? "/api/owner/gym"
        : mode === "edit" && initialData?.id
          ? `/api/gyms/${initialData.id}`
          : "/api/gyms";

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (!isOwner) headers["x-admin-secret"] = ADMIN_SECRET;

      const res = await fetch(url, {
        method: isOwner ? (mode === "edit" ? "PUT" : "POST") : mode === "edit" ? "PUT" : "POST",
        headers,
        credentials: isOwner ? "include" : "same-origin",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      if (isOwner && mode === "create") {
        trackGAEvent(GA_EVENTS.profile_created, {
          profile_type: "gym",
          entity_id: data.data?.id,
          entity_name: form.name,
        });
      }

      router.push(successPath ?? (isOwner ? "/owner/dashboard" : "/admin"));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isOwnerWizard && step < totalSteps) {
      goNext();
      return;
    }
    void submitForm();
  }

  const inputClass =
    "w-full px-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]";

  const labelClass = "block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5";

  return (
    <form onSubmit={handleSubmit} noValidate={isOwnerWizard} className="space-y-6">
      {isOwnerWizard && (
        <OwnerGymStepIndicator
          currentStep={step}
          completedSteps={completedOwnerSteps}
          onStepClick={(targetStep) => {
            if (targetStep === step) return;
            if (mode === "edit" && completedOwnerSteps.has(targetStep)) {
              goToStep(targetStep);
              return;
            }
            if (targetStep < step) goToStep(targetStep);
          }}
        />
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic info */}
      {showStep(1) && (
      <SectionCard title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>
              {ownerCopy?.nameLabel ?? "Gym Name"} *
            </label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={ownerCopy?.namePlaceholder ?? "e.g. Iron Will Fitness Club"}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Slug (URL)</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="auto-generated if empty"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              {ownerCopy?.typeLabel ?? "Type"} *
            </label>
            <select
              required
              value={form.type}
              onChange={(e) => {
                const value = e.target.value;
                set("type", value);
                if (value !== CUSTOM_TYPE_VALUE) set("customTypeLabel", "");
              }}
              className={inputClass}
            >
              {typeOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
              <option value={CUSTOM_TYPE_VALUE}>Other — specify below</option>
            </select>
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">{typeHint}</p>
            {isCustomType && (
              <div className="mt-3">
                <label className={labelClass}>{customTypeFieldLabel} *</label>
                <input
                  required
                  type="text"
                  value={form.customTypeLabel}
                  onChange={(e) => set("customTypeLabel", e.target.value)}
                  placeholder={customTypePlaceholder}
                  className={inputClass}
                />
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={
                ownerCopy?.descriptionPlaceholder ??
                "Describe the gym, its facilities, atmosphere, and what makes it special…"
              }
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </SectionCard>
      )}

      {/* Location */}
      {showStep(2) && (
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
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Area *</label>
            <select
              value={areaQuickPickValue}
              onChange={(e) => {
                if (e.target.value) set("area", e.target.value);
              }}
              className={`${inputClass} mb-2`}
            >
              <option value="">Quick pick from popular areas (optional)</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <input
              required
              type="text"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              placeholder="e.g. Dhoke Chaudhrian, F-7/2, or your neighbourhood"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">{areaHint}</p>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Full Address *</label>
            <input
              required
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="e.g. Shop 12, Civic Center, Blue Area, Islamabad"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Latitude (optional)</label>
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => set("latitude", e.target.value)}
              placeholder="33.6844"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Longitude (optional)</label>
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => set("longitude", e.target.value)}
              placeholder="73.0479"
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>
      )}

      {/* Pricing */}
      {showStep(3) && (
      <>
      <SectionCard title="Membership Pricing">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Min Price (PKR/month) *</label>
            <input
              required
              type="number"
              min={0}
              value={form.priceMin}
              onChange={(e) => set("priceMin", e.target.value)}
              placeholder="3000"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Max Price (PKR/month) *</label>
            <input
              required
              type="number"
              min={0}
              value={form.priceMax}
              onChange={(e) => set("priceMax", e.target.value)}
              placeholder="6000"
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>

      {/* Operating hours */}
      <SectionCard title="Operating Hours">
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Set your facility schedules here. Choose your access policy first — separate
          men&apos;s/mixed and ladies-only timings appear when relevant.
        </p>

        <div className="mb-6 max-w-md">
          <label className={labelClass}>Access & Gender Policy *</label>
          <select
            required
            value={form.ladiesStatus}
            onChange={(e) => {
              const nextStatus = e.target.value;
              set("ladiesStatus", nextStatus);
              if (nextStatus !== "ladies_timings") set("ladiesHours", "");
            }}
            className={inputClass}
          >
            {LADIES_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
            <div className="mb-4">
              <h4 className="font-heading font-bold text-[var(--text)]">
                {form.ladiesStatus === "ladies_timings"
                  ? "General Facility Hours"
                  : "Facility Hours"}
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {form.ladiesStatus === "ladies_timings"
                  ? "When the gym is open to mixed or men's access outside ladies-only windows."
                  : form.ladiesStatus === "ladies_only"
                    ? "Your ladies-only facility schedule."
                    : form.ladiesStatus === "men_only"
                      ? "Your men's facility schedule."
                      : "Your standard opening schedule shown on the public listing."}
              </p>
            </div>
            <OpeningHoursFields
              value={form.openingHours}
              onChange={(value) => set("openingHours", value)}
              labelClass={labelClass}
              inputClass={inputClass}
              daysLabel={
                form.ladiesStatus === "ladies_timings"
                  ? "General Access Days"
                  : "Opening Days"
              }
              openLabel={
                form.ladiesStatus === "ladies_timings"
                  ? "General access starts"
                  : "Opens at"
              }
              closeLabel={
                form.ladiesStatus === "ladies_timings"
                  ? "General access ends"
                  : "Closes at"
              }
              previewPrefix={
                form.ladiesStatus === "ladies_timings" ? "General hours" : "Saved as"
              }
            />
          </div>

          {form.ladiesStatus === "ladies_timings" && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5">
              <div className="mb-4">
                <h4 className="font-heading font-bold text-purple-900">
                  Ladies-Only Hours
                </h4>
                <p className="text-xs text-purple-800/80 mt-1">
                  Dedicated women&apos;s training window — separate from general
                  facility hours above.
                </p>
              </div>
              <LadiesOnlyHoursFields
                value={form.ladiesHours}
                onChange={(value) => set("ladiesHours", value)}
                labelClass={labelClass}
                inputClass={inputClass}
              />
            </div>
          )}
        </div>
      </SectionCard>
      </>
      )}

      {/* Details */}
      {showStep(4) && (
      <SectionCard title="Details & Status">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Size Category *</label>
            <select
              required
              value={form.sizeCategory}
              onChange={(e) => set("sizeCategory", e.target.value)}
              className={inputClass}
            >
              {SIZE_CATEGORIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {variant === "admin" && (
            <div>
              <label className={labelClass}>Rating (optional)</label>
              <input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(e) => set("rating", e.target.value)}
                placeholder="4.5"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className={labelClass}>WhatsApp Number *</label>
            <input
              required
              type="text"
              value={form.whatsappNumber}
              onChange={(e) => set("whatsappNumber", e.target.value)}
              placeholder="03001234567"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Established Year (optional)</label>
            <input
              type="number"
              min={1950}
              max={new Date().getFullYear()}
              value={form.establishedYear}
              onChange={(e) => set("establishedYear", e.target.value)}
              placeholder="2018"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Member Count (optional)</label>
            <input
              type="number"
              min={0}
              value={form.memberCount}
              onChange={(e) => set("memberCount", e.target.value)}
              placeholder="500"
              className={inputClass}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Shown on your public profile as a trust stat (e.g. 500+ Members).
            </p>
          </div>

          {variant === "admin" && (
            <div className="sm:col-span-2 flex items-center gap-3 pt-5">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="w-4 h-4 accent-[#FF6A3D] rounded"
              />
              <label htmlFor="featured" className="text-sm font-medium text-[var(--text)] cursor-pointer">
                Mark as Featured (shows in homepage)
              </label>
            </div>
          )}
        </div>

        {variant === "admin" && (
          <div className="mt-4">
            <label className={labelClass}>
              {ownerCopy?.coachLabel ?? "Coach Information (optional)"}
            </label>
            <textarea
              rows={3}
              value={form.coachInfo}
              onChange={(e) => set("coachInfo", e.target.value)}
              placeholder={
                ownerCopy?.coachPlaceholder ??
                "Describe the coaches, their experience, and certifications…"
              }
              className={`${inputClass} resize-none`}
            />
          </div>
        )}
      </SectionCard>
      )}

      {/* Disciplines */}
      {showStep(5) && (
      <>
      <SectionCard title={ownerCopy?.disciplinesTitle ?? "Disciplines"}>
        <CustomTagPicker
          predefined={visibleDisciplines}
          selectedIds={form.disciplineIds}
          customNames={form.customDisciplineNames}
          onSelectedIdsChange={(ids) => set("disciplineIds", ids)}
          onCustomNamesChange={(names) => set("customDisciplineNames", names)}
          customLabel="Add Custom Discipline"
          customPlaceholder="e.g. Sambo, Capoeira, Taekwondo"
          customHint="Type a discipline not listed above and click Add."
          inputClass={inputClass}
          labelClass={labelClass}
        />
      </SectionCard>

      {/* Amenities */}
      <SectionCard title="Amenities & Facilities">
        <CustomTagPicker
          predefined={amenities}
          selectedIds={form.amenityIds}
          customNames={form.customAmenityNames}
          onSelectedIdsChange={(ids) => set("amenityIds", ids)}
          onCustomNamesChange={(names) => set("customAmenityNames", names)}
          customLabel="Add Custom Amenity"
          customPlaceholder="e.g. Outdoor Training Area, Recovery Room"
          customHint="Type a facility not listed above and click Add."
          inputClass={inputClass}
          labelClass={labelClass}
        />
      </SectionCard>
      </>
      )}

      {/* Images — Cloudinary */}
      {isOwnerWizard ? (
      <div className={step === 6 ? undefined : "hidden"} aria-hidden={step !== 6}>
      <SectionCard title="Images">
        <div className="space-y-8">
          <ImageUploader
            key={`owner-cover-${form.coverImage?.imageUrl ?? "empty"}`}
            label="Cover Image"
            description="Main photo shown on gym cards and at the top of the profile page."
            uploadType="cover"
            multiple={false}
            images={form.coverImage ? [form.coverImage] : []}
            onChange={(imgs) => set("coverImage", imgs[0] ?? null)}
            authMode="cookie"
          />

          <ImageUploader
            key={`owner-gallery-${form.galleryImages.map((img) => img.id ?? img.imageUrl).join(",") || "empty"}`}
            label="Gallery Images"
            description="Additional photos for the gym profile gallery. Upload up to 10 images."
            uploadType="gallery"
            multiple
            maxImages={10}
            images={form.galleryImages}
            onChange={(imgs) => set("galleryImages", imgs)}
            authMode="cookie"
          />
        </div>
      </SectionCard>
      </div>
      ) : showStep(6) && (
      <SectionCard title="Images">
        <div className="space-y-8">
          <ImageUploader
            label="Cover Image"
            description="Main photo shown on gym cards and at the top of the profile page."
            uploadType="cover"
            multiple={false}
            images={form.coverImage ? [form.coverImage] : []}
            onChange={(imgs) => set("coverImage", imgs[0] ?? null)}
            authMode="admin-secret"
          />

          <ImageUploader
            label="Gallery Images"
            description={`Additional photos for the gym profile gallery. Upload up to ${ADMIN_CREATE_GALLERY_IMAGE_LIMIT} images.`}
            uploadType="gallery"
            multiple
            maxImages={ADMIN_CREATE_GALLERY_IMAGE_LIMIT}
            images={form.galleryImages}
            onChange={(imgs) => set("galleryImages", imgs)}
            authMode="admin-secret"
          />
        </div>
      </SectionCard>
      )}

      {/* Navigation */}
      {isOwnerWizard ? (
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pb-8 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={goBack}
            disabled={step === 1}
          >
            Back
          </Button>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() =>
                router.push(cancelPath ?? "/owner/dashboard")
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              isLoading={saving && step === totalSteps}
              disabled={step === totalSteps && hasUploadingImages}
              onClick={() => {
                if (step < totalSteps) {
                  goNext();
                  return;
                }
                void submitForm();
              }}
            >
              {step < totalSteps
                ? "Continue"
                : saving
                  ? "Saving…"
                  : mode === "edit"
                    ? "Save Changes"
                    : "Submit Listing"}
            </Button>
          </div>
        </div>
      ) : (
      <div className="flex items-center gap-3 pb-8">
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          isLoading={saving}
          disabled={hasUploadingImages}
        >
          {saving ? "Saving…" : mode === "edit" ? "Save Changes" : "Create Gym"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push(cancelPath ?? "/admin")}
        >
          Cancel
        </Button>
      </div>
      )}
    </form>
  );
}

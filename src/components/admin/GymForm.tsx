"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { UploadedImage } from "@/lib/gym-images-form";
import {
  GYM_TYPES,
  LADIES_STATUS_OPTIONS,
  SIZE_CATEGORIES,
  CITIES,
  RAWALPINDI_AREAS,
  ISLAMABAD_AREAS,
} from "@/lib/constants";
import type { Discipline, Amenity } from "@prisma/client";

interface GymFormData {
  name: string;
  slug: string;
  type: string;
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
  whatsappNumber: string;
  openingHours: string;
  coachInfo: string;
  featured: boolean;
  rating: string;
  coverImage: UploadedImage | null;
  galleryImages: UploadedImage[];
  disciplineIds: string[];
  amenityIds: string[];
}

interface GymFormProps {
  initialData?: Partial<GymFormData & { id: string }>;
  disciplines: Discipline[];
  amenities: Amenity[];
  mode: "create" | "edit";
  variant?: "admin" | "owner";
  cancelPath?: string;
  successPath?: string;
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "gymfinder-admin-2024";

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
  cancelPath,
  successPath,
}: GymFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<GymFormData>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    type: initialData?.type ?? "gym",
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
    whatsappNumber: initialData?.whatsappNumber ?? "",
    openingHours: initialData?.openingHours ?? "",
    coachInfo: initialData?.coachInfo ?? "",
    featured: initialData?.featured ?? false,
    rating: initialData?.rating ?? "",
    coverImage: initialData?.coverImage ?? null,
    galleryImages: initialData?.galleryImages ?? [],
    disciplineIds: initialData?.disciplineIds ?? [],
    amenityIds: initialData?.amenityIds ?? [],
  });

  const areas = form.city === "Islamabad" ? ISLAMABAD_AREAS : RAWALPINDI_AREAS;

  const set = (key: keyof GymFormData, value: GymFormData[keyof GymFormData]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const toggleDiscipline = (id: string) => {
    set(
      "disciplineIds",
      form.disciplineIds.includes(id)
        ? form.disciplineIds.filter((d) => d !== id)
        : [...form.disciplineIds, id]
    );
  };

  const toggleAmenity = (id: string) => {
    set(
      "amenityIds",
      form.amenityIds.includes(id)
        ? form.amenityIds.filter((a) => a !== id)
        : [...form.amenityIds, id]
    );
  };

  const hasUploadingImages =
    form.coverImage?.status === "uploading" ||
    form.coverImage?.status === "pending" ||
    form.galleryImages.some((img) => img.status === "uploading" || img.status === "pending");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasUploadingImages) {
      setError("Please wait for all images to finish uploading.");
      return;
    }

    setSaving(true);
    setError("");

    const coverPayload = form.coverImage?.imageUrl
      ? { imageUrl: form.coverImage.imageUrl, publicId: form.coverImage.publicId }
      : null;

    const galleryPayload = form.galleryImages
      .filter((img) => img.status === "uploaded" && img.imageUrl)
      .map((img) => ({
        id:       img.id,
        imageUrl: img.imageUrl,
        publicId: img.publicId,
      }));

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      type: form.type,
      description: form.description,
      address: form.address,
      area: form.area,
      city: form.city,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      priceMin: parseInt(form.priceMin),
      priceMax: parseInt(form.priceMax),
      ladiesStatus: form.ladiesStatus,
      sizeCategory: form.sizeCategory,
      whatsappNumber: form.whatsappNumber,
      openingHours: form.openingHours || null,
      coachInfo: form.coachInfo || null,
      ...(variant === "admin" && {
        featured: form.featured,
        rating: form.rating ? parseFloat(form.rating) : null,
      }),
      disciplines: form.disciplineIds,
      amenities: form.amenityIds,
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

      router.push(successPath ?? (isOwner ? "/owner/dashboard" : "/admin"));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]";

  const labelClass = "block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic info */}
      <SectionCard title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Gym Name *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Iron Will Fitness Club"
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
            <label className={labelClass}>Type *</label>
            <select
              required
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className={inputClass}
            >
              {GYM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the gym, its facilities, atmosphere, and what makes it special…"
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </SectionCard>

      {/* Location */}
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
              required
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              className={inputClass}
            >
              <option value="">Select area…</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
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

      {/* Pricing & hours */}
      <SectionCard title="Pricing & Hours">
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

          <div className="sm:col-span-2">
            <label className={labelClass}>Opening Hours</label>
            <input
              type="text"
              value={form.openingHours}
              onChange={(e) => set("openingHours", e.target.value)}
              placeholder="e.g. Mon–Sat 6AM–10PM"
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>

      {/* Details */}
      <SectionCard title="Details & Status">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Ladies Status *</label>
            <select
              required
              value={form.ladiesStatus}
              onChange={(e) => set("ladiesStatus", e.target.value)}
              className={inputClass}
            >
              {LADIES_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

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

        <div className="mt-4">
          <label className={labelClass}>Coach Information (optional)</label>
          <textarea
            rows={3}
            value={form.coachInfo}
            onChange={(e) => set("coachInfo", e.target.value)}
            placeholder="Describe the coaches, their experience, and certifications…"
            className={`${inputClass} resize-none`}
          />
        </div>
      </SectionCard>

      {/* Disciplines */}
      <SectionCard title="Disciplines">
        <div className="flex flex-wrap gap-2">
          {disciplines.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => toggleDiscipline(d.id)}
              className={`px-3 py-2 text-sm font-medium rounded-xl border transition-colors ${
                form.disciplineIds.includes(d.id)
                  ? "bg-[#0B2545] text-white border-[#0B2545]"
                  : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Amenities */}
      <SectionCard title="Amenities & Facilities">
        <div className="flex flex-wrap gap-2 mb-4">
          {amenities.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAmenity(a.id)}
              className={`px-3 py-2 text-sm font-medium rounded-xl border transition-colors ${
                form.amenityIds.includes(a.id)
                  ? "bg-[#0B2545] text-white border-[#0B2545]"
                  : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Images — Cloudinary */}
      <SectionCard title="Images">
        <div className="space-y-8">
          <ImageUploader
            label="Cover Image"
            description="Main photo shown on gym cards and at the top of the profile page."
            uploadType="cover"
            multiple={false}
            images={form.coverImage ? [form.coverImage] : []}
            onChange={(imgs) => set("coverImage", imgs[0] ?? null)}
            authMode={variant === "owner" ? "cookie" : "admin-secret"}
          />

          <ImageUploader
            label="Gallery Images"
            description="Additional photos for the gym profile gallery. Upload up to 10 images."
            uploadType="gallery"
            multiple
            maxImages={10}
            images={form.galleryImages}
            onChange={(imgs) => set("galleryImages", imgs)}
            authMode={variant === "owner" ? "cookie" : "admin-secret"}
          />
        </div>
      </SectionCard>

      {/* Submit */}
      <div className="flex items-center gap-3 pb-8">
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          isLoading={saving}
          disabled={hasUploadingImages}
        >
          {saving ? "Saving…" : mode === "edit" ? "Save Changes" : variant === "owner" ? "Submit Listing" : "Create Gym"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push(cancelPath ?? (variant === "owner" ? "/owner/dashboard" : "/admin"))}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Save } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { UploadedImage } from "@/lib/gym-images-form";
import {
  StaffAchievementsField,
  StaffCertificationsField,
} from "@/components/owner/staff/StaffListFields";
import { TrainerAvailabilityField } from "@/components/trainers/TrainerAvailabilityField";
import { CITIES } from "@/lib/constants";
import {
  TRAINER_SPECIALIZATIONS,
  TRAINER_GENDER_OPTIONS,
} from "@/lib/trainer-constants";
import {
  parseAchievements,
  parseCertifications,
  type StaffAchievementItem,
  type StaffCertificationItem,
} from "@/lib/staff-members";
import {
  parseTrainerAvailability,
  type TrainerAvailabilitySlot,
} from "@/lib/trainer-availability";
import type { Trainer } from "@prisma/client";

interface GymOption {
  id: string;
  name: string;
  city: string;
  area: string;
}

interface AdminTrainerFormProps {
  trainer?: Trainer | null;
  gyms: GymOption[];
  mode: "create" | "edit";
}

export function AdminTrainerForm({ trainer, gyms, mode }: AdminTrainerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: trainer?.fullName ?? "",
    headline: trainer?.headline ?? "",
    bio: trainer?.bio ?? "",
    city: trainer?.city ?? CITIES[0],
    area: trainer?.area ?? "",
    specialization: trainer?.specialization ?? "fitness",
    experienceYears: trainer?.experienceYears?.toString() ?? "",
    hourlyRate: trainer?.hourlyRate?.toString() ?? "",
    whatsappNumber: trainer?.whatsappNumber ?? "",
    email: trainer?.email ?? "",
    gender: trainer?.gender ?? "",
    gymId: trainer?.gymId ?? "",
    isPublished: trainer?.isPublished ?? false,
    isVerified: trainer?.isVerified ?? false,
    isFeatured: trainer?.isFeatured ?? false,
  });

  const [certifications, setCertifications] = useState<StaffCertificationItem[]>(() =>
    trainer ? parseCertifications(trainer.certifications) : []
  );
  const [achievements, setAchievements] = useState<StaffAchievementItem[]>(() =>
    trainer ? parseAchievements(trainer.achievements) : []
  );
  const [availabilitySlots, setAvailabilitySlots] = useState<TrainerAvailabilitySlot[]>(() =>
    trainer ? parseTrainerAvailability(trainer.availability) : []
  );
  const [photo, setPhoto] = useState<UploadedImage[]>(() =>
    trainer?.profileImage
      ? [
          {
            imageUrl: trainer.profileImage,
            publicId: trainer.cloudinaryId ?? undefined,
            status: "uploaded",
            progress: 100,
          },
        ]
      : []
  );

  const uploadedPhoto = photo.find((p) => p.status === "uploaded");

  const inputClass =
    "w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30";
  const textareaClass =
    "w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30";
  const labelClass = "block text-sm font-semibold text-[var(--text)] mb-1.5";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (photo.some((p) => p.status === "uploading" || p.status === "pending")) {
      setError("Please wait for the profile photo upload to finish.");
      setLoading(false);
      return;
    }

    const payload = {
      ...form,
      experienceYears: form.experienceYears ? Number(form.experienceYears) : null,
      hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
      gender: form.gender || null,
      gymId: form.gymId || null,
      profileImage: uploadedPhoto?.imageUrl ?? null,
      cloudinaryId: uploadedPhoto?.publicId ?? null,
      certifications,
      achievements,
      availabilitySlots,
    };

    try {
      const url =
        mode === "create" ? "/api/admin/trainers" : `/api/admin/trainers/${trainer!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save trainer.");
        return;
      }

      router.push("/admin/trainers");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ImageUploader
        label="Profile Photo"
        description="Square or portrait photos work best. JPEG, PNG, or WebP up to 10 MB."
        images={photo}
        onChange={setPhoto}
        multiple={false}
        maxImages={1}
        uploadType="coach"
        previewAspect="square"
        centered
        replaceLabel="Replace photo"
        className="pb-2 border-b border-[var(--border)] mb-6"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Full name *</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Headline</label>
          <input
            value={form.headline}
            onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
            placeholder="Certified boxing coach · 8+ years"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>City *</label>
          <select
            required
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className={inputClass}
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Area</label>
          <input
            value={form.area}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Specialization</label>
          <select
            value={form.specialization}
            onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
            className={inputClass}
          >
            {TRAINER_SPECIALIZATIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Affiliated gym</label>
          <select
            value={form.gymId}
            onChange={(e) => setForm((f) => ({ ...f, gymId: e.target.value }))}
            className={inputClass}
          >
            <option value="">None</option>
            {gyms.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name} — {gym.area}, {gym.city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Experience (years)</label>
          <input
            type="number"
            min={0}
            max={60}
            value={form.experienceYears}
            onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Hourly rate (PKR)</label>
          <input
            type="number"
            min={0}
            value={form.hourlyRate}
            onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Gender</label>
          <select
            value={form.gender}
            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
            className={inputClass}
          >
            <option value="">Prefer not to say</option>
            {TRAINER_GENDER_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>WhatsApp *</label>
          <input
            required
            value={form.whatsappNumber}
            onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))}
            placeholder="03001234567"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Public email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Bio</label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className={textareaClass}
          />
        </div>

        <StaffCertificationsField items={certifications} onChange={setCertifications} />
        <StaffAchievementsField items={achievements} onChange={setAchievements} />
        <TrainerAvailabilityField slots={availabilitySlots} onChange={setAvailabilitySlots} />

        <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2 border-t border-[var(--border)]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="rounded border-[var(--border)]"
            />
            <span className="text-sm font-semibold text-[var(--text)]">Published (visible on site)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isVerified}
              onChange={(e) => setForm((f) => ({ ...f, isVerified: e.target.checked }))}
              className="rounded border-[var(--border)]"
            />
            <span className="text-sm font-semibold text-[var(--text)]">Verified badge</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              className="rounded border-[var(--border)]"
            />
            <span className="text-sm font-semibold text-[var(--text)]">Featured trainer</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {mode === "create" ? "Create trainer" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/trainers")}
          className="px-4 py-3 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

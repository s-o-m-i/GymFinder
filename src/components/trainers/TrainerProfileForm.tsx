"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Save } from "lucide-react";
import { saveTrainerProfile } from "@/app/actions/trainer/profile";
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

interface TrainerProfileFormProps {
  trainer: Trainer | null;
  accountEmail: string;
}

export function TrainerProfileForm({ trainer, accountEmail }: TrainerProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    email: trainer?.email ?? accountEmail,
    gender: trainer?.gender ?? "",
    gymId: trainer?.gymId ?? "",
    isPublished: trainer?.isPublished ?? false,
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
    "w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]";
  const textareaClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (photo.some((p) => p.status === "uploading" || p.status === "pending")) {
      setError("Please wait for the profile photo upload to finish.");
      setLoading(false);
      return;
    }

    const result = await saveTrainerProfile({
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
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    router.push("/trainer/dashboard");
    router.refresh();
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
        authMode="cookie"
        previewAspect="square"
        centered
        replaceLabel="Replace photo"
        className="pb-2 border-b border-gray-100 mb-6"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full name *</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Headline</label>
          <input
            value={form.headline}
            onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
            placeholder="Certified boxing coach · 8+ years"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Area</label>
          <input
            value={form.area}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Specialization</label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Experience (years)</label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hourly rate (PKR)</label>
          <input
            type="number"
            min={0}
            value={form.hourlyRate}
            onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp *</label>
          <input
            required
            value={form.whatsappNumber}
            onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))}
            placeholder="03001234567"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Public email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className={textareaClass}
          />
        </div>

        <StaffCertificationsField
          items={certifications}
          onChange={setCertifications}
        />

        <StaffAchievementsField
          items={achievements}
          onChange={setAchievements}
        />

        <TrainerAvailabilityField
          slots={availabilitySlots}
          onChange={setAvailabilitySlots}
        />

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-semibold text-gray-700">
              Publish profile on marketplace
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
          Profile saved successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] disabled:opacity-70"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save profile
      </button>
    </form>
  );
}

"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { UploadedImage } from "@/lib/gym-images-form";
import { CITIES } from "@/lib/constants";
import {
  TRAINER_GENDER_OPTIONS,
  TRAINER_SPECIALIZATIONS,
} from "@/lib/trainer-constants";
import type { TrainerProfileFormValues } from "@/components/trainers/profile-wizard/types";
import {
  fieldErrorClass,
  wizardInputClass,
} from "@/components/trainers/profile-wizard/styles";

interface BasicInfoStepProps {
  register: UseFormRegister<TrainerProfileFormValues>;
  errors: FieldErrors<TrainerProfileFormValues>;
  photo: UploadedImage[];
  onPhotoChange: (images: UploadedImage[]) => void;
  photoError?: string | null;
}

export function BasicInfoStep({
  register,
  errors,
  photo,
  onPhotoChange,
  photoError,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <ImageUploader
        label="Profile Photo"
        description="Square or portrait photos work best. JPEG, PNG, or WebP up to 10 MB."
        images={photo}
        onChange={onPhotoChange}
        multiple={false}
        maxImages={1}
        uploadType="coach"
        authMode="cookie"
        previewAspect="square"
        centered
        replaceLabel="Replace photo"
        className="pb-2 border-b border-gray-100"
      />
      {photoError && <p className="text-xs text-red-600 -mt-4">{photoError}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full name *</label>
          <input
            {...register("fullName")}
            className={`${wizardInputClass} ${fieldErrorClass(Boolean(errors.fullName))}`}
          />
          {errors.fullName && (
            <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Headline</label>
          <input
            {...register("headline")}
            placeholder="Certified boxing coach · 8+ years"
            className={`${wizardInputClass} ${fieldErrorClass(Boolean(errors.headline))}`}
          />
          {errors.headline && (
            <p className="text-xs text-red-600 mt-1">{errors.headline.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
          <select
            {...register("city")}
            className={`${wizardInputClass} ${fieldErrorClass(Boolean(errors.city))}`}
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Area</label>
          <input
            {...register("area")}
            className={`${wizardInputClass} ${fieldErrorClass(Boolean(errors.area))}`}
          />
          {errors.area && <p className="text-xs text-red-600 mt-1">{errors.area.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Specialization</label>
          <select {...register("specialization")} className={wizardInputClass}>
            {TRAINER_SPECIALIZATIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Experience (years)
          </label>
          <input
            type="number"
            min={0}
            max={60}
            {...register("experienceYears")}
            className={`${wizardInputClass} ${fieldErrorClass(Boolean(errors.experienceYears))}`}
          />
          {errors.experienceYears && (
            <p className="text-xs text-red-600 mt-1">{String(errors.experienceYears.message)}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
          <select {...register("gender")} className={wizardInputClass}>
            <option value="">Prefer not to say</option>
            {TRAINER_GENDER_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

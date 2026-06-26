"use client";

import Image from "next/image";
import type { UseFormRegister, UseFormWatch } from "react-hook-form";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { UploadedImage } from "@/lib/gym-images-form";
import type { ProfileCompletionResult } from "@/lib/trainer-profile-completion";
import {
  TRAINER_GENDER_OPTIONS,
  TRAINER_SPECIALIZATIONS,
} from "@/lib/trainer-constants";
import { formatAvailabilitySlot } from "@/lib/trainer-availability";
import type { TrainerProfileFormValues } from "@/components/trainers/profile-wizard/types";
import { cn } from "@/lib/utils";

interface ReviewStepProps {
  register: UseFormRegister<TrainerProfileFormValues>;
  watch: UseFormWatch<TrainerProfileFormValues>;
  photo: UploadedImage[];
  completion: ProfileCompletionResult;
}

function PreviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-1 sm:gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-800 break-words">{value || "—"}</dd>
    </div>
  );
}

export function ReviewStep({ register, watch, photo, completion }: ReviewStepProps) {
  const values = watch();
  const uploadedPhoto = photo.find((p) => p.status === "uploaded");
  const specializationLabel =
    TRAINER_SPECIALIZATIONS.find((s) => s.value === values.specialization)?.label ??
    values.specialization;
  const genderLabel =
    TRAINER_GENDER_OPTIONS.find((g) => g.value === values.gender)?.label ?? "Prefer not to say";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#0B2545]/5 to-[#FF6A3D]/5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-700">Profile completion</p>
            <p className="text-2xl font-bold text-[#0B2545]">{completion.percentage}%</p>
          </div>
          <div className="h-2 flex-1 min-w-[8rem] max-w-xs overflow-hidden rounded-full bg-white/80">
            <div
              className="h-full rounded-full bg-[#FF6A3D] transition-all duration-500"
              style={{ width: `${completion.percentage}%` }}
            />
          </div>
        </div>

        {completion.missingRecommended.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Recommended fields to complete
            </p>
            <ul className="flex flex-wrap gap-2">
              {completion.missingRecommended.map((field) => (
                <li
                  key={field.key}
                  className="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-medium text-amber-800 border border-amber-200"
                >
                  {field.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {completion.percentage >= 80 && (
          <p className="mt-3 flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Your profile looks great — ready to publish!
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-800">Profile preview</h3>
        </div>
        <dl className="px-4 py-2">
          <PreviewRow
            label="Photo"
            value={
              uploadedPhoto?.imageUrl ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200">
                  <Image
                    src={uploadedPhoto.imageUrl}
                    alt="Profile"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                "No photo uploaded"
              )
            }
          />
          <PreviewRow label="Name" value={values.fullName} />
          <PreviewRow label="Headline" value={values.headline} />
          <PreviewRow label="City" value={values.city} />
          <PreviewRow label="Area" value={values.area} />
          <PreviewRow label="Specialization" value={specializationLabel} />
          <PreviewRow
            label="Experience"
            value={values.experienceYears ? `${values.experienceYears} years` : null}
          />
          <PreviewRow label="Gender" value={genderLabel} />
          <PreviewRow
            label="Hourly rate"
            value={values.hourlyRate ? `PKR ${Number(values.hourlyRate).toLocaleString()}` : null}
          />
          <PreviewRow label="WhatsApp" value={values.whatsappNumber} />
          <PreviewRow label="Email" value={values.email} />
          <PreviewRow label="Bio" value={values.bio} />
          <PreviewRow
            label="Achievements"
            value={
              values.achievements.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1">
                  {values.achievements.map((a) => (
                    <li key={a.id}>{a.name}</li>
                  ))}
                </ul>
              ) : null
            }
          />
          <PreviewRow
            label="Certifications"
            value={
              values.certifications.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1">
                  {values.certifications.map((c) => (
                    <li key={c.id}>{c.name}</li>
                  ))}
                </ul>
              ) : null
            }
          />
          <PreviewRow
            label="Availability"
            value={
              values.availabilitySlots.length > 0 ? (
                <ul className="space-y-1">
                  {values.availabilitySlots.map((slot) => (
                    <li key={slot.id} className="text-sm">
                      {formatAvailabilitySlot(slot)}
                    </li>
                  ))}
                </ul>
              ) : null
            }
          />
        </dl>
      </div>

      <label
        className={cn(
          "flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4",
          "hover:border-[#0B2545]/30 transition-colors"
        )}
      >
        <input
          type="checkbox"
          {...register("isPublished")}
          className="mt-0.5 rounded border-gray-300"
        />
        <span>
          <span className="block text-sm font-semibold text-gray-700">
            Publish profile on marketplace
          </span>
          <span className="block text-xs text-gray-500 mt-0.5">
            When enabled, your profile will be visible to clients searching for trainers.
          </span>
        </span>
      </label>
    </div>
  );
}

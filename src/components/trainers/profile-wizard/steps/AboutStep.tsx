"use client";

import type { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { StaffAchievementsField } from "@/components/owner/staff/StaffListFields";
import type { TrainerProfileFormValues } from "@/components/trainers/profile-wizard/types";
import {
  fieldErrorClass,
  wizardTextareaClass,
} from "@/components/trainers/profile-wizard/styles";

interface AboutStepProps {
  register: UseFormRegister<TrainerProfileFormValues>;
  errors: FieldErrors<TrainerProfileFormValues>;
  watch: UseFormWatch<TrainerProfileFormValues>;
  setValue: UseFormSetValue<TrainerProfileFormValues>;
}

export function AboutStep({ register, errors, watch, setValue }: AboutStepProps) {
  const achievements = watch("achievements");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
        <textarea
          rows={4}
          {...register("bio")}
          className={`${wizardTextareaClass} ${fieldErrorClass(Boolean(errors.bio))}`}
        />
        {errors.bio && <p className="text-xs text-red-600 mt-1">{errors.bio.message}</p>}
      </div>

      <StaffAchievementsField
        items={achievements}
        onChange={(items) =>
          setValue("achievements", items, { shouldDirty: true, shouldValidate: false })
        }
        error={errors.achievements?.message as string | undefined}
      />
    </div>
  );
}

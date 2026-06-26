"use client";

import type { FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { TrainerAvailabilityField } from "@/components/trainers/TrainerAvailabilityField";
import type { TrainerProfileFormValues } from "@/components/trainers/profile-wizard/types";

interface AvailabilityStepProps {
  watch: UseFormWatch<TrainerProfileFormValues>;
  setValue: UseFormSetValue<TrainerProfileFormValues>;
  errors: FieldErrors<TrainerProfileFormValues>;
}

export function AvailabilityStep({ watch, setValue, errors }: AvailabilityStepProps) {
  const availabilitySlots = watch("availabilitySlots");

  return (
    <TrainerAvailabilityField
      slots={availabilitySlots}
      onChange={(slots) =>
        setValue("availabilitySlots", slots, { shouldDirty: true, shouldValidate: false })
      }
      error={errors.availabilitySlots?.message as string | undefined}
    />
  );
}

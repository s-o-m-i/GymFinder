"use client";

import type { FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { StaffCertificationsField } from "@/components/owner/staff/StaffListFields";
import type { TrainerProfileFormValues } from "@/components/trainers/profile-wizard/types";

interface CertificationsStepProps {
  watch: UseFormWatch<TrainerProfileFormValues>;
  setValue: UseFormSetValue<TrainerProfileFormValues>;
  errors: FieldErrors<TrainerProfileFormValues>;
}

export function CertificationsStep({ watch, setValue, errors }: CertificationsStepProps) {
  const certifications = watch("certifications");

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Add your credentials and optional certificate photos. Clients trust verified qualifications.
      </p>
      <StaffCertificationsField
        items={certifications}
        onChange={(items) =>
          setValue("certifications", items, { shouldDirty: true, shouldValidate: false })
        }
        error={errors.certifications?.message as string | undefined}
      />
    </div>
  );
}

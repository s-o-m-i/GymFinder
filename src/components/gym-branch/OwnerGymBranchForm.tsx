"use client";

import {
  createOwnerGymBranch,
  updateOwnerGymBranch,
} from "@/app/actions/owner/gym-branches";
import {
  GymBranchForm,
  type GymBranchFormState,
} from "@/components/gym-branch/GymBranchForm";

interface OwnerGymBranchFormProps {
  gymName: string;
  mode: "create" | "edit";
  branchId?: string;
  initialData?: GymBranchFormState;
  disciplines: { id: string; name: string }[];
  amenities: { id: string; name: string }[];
}

export function OwnerGymBranchForm({
  gymName,
  mode,
  branchId,
  initialData,
  disciplines,
  amenities,
}: OwnerGymBranchFormProps) {
  return (
    <GymBranchForm
      mode={mode}
      initialData={initialData}
      gymName={gymName}
      cancelHref="/owner/branches"
      successHref="/owner/branches"
      commonSettingsHref="/owner/common"
      imageAuthMode="cookie"
      disciplines={disciplines}
      amenities={amenities}
      onSubmit={(input) =>
        mode === "edit" && branchId
          ? updateOwnerGymBranch(branchId, input)
          : createOwnerGymBranch(input)
      }
    />
  );
}

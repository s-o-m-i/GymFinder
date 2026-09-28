"use client";

import {
  createAdminGymBranch,
  updateAdminGymBranch,
} from "@/app/actions/admin/gym-branches";
import {
  GymBranchForm,
  type GymBranchFormState,
} from "@/components/gym-branch/GymBranchForm";

interface AdminGymBranchFormProps {
  gymId: string;
  gymName: string;
  mode: "create" | "edit";
  branchId?: string;
  initialData?: GymBranchFormState;
}

export function AdminGymBranchForm({
  gymId,
  gymName,
  mode,
  branchId,
  initialData,
}: AdminGymBranchFormProps) {
  const cancelHref = `/admin/edit-gym/${gymId}`;
  return (
    <GymBranchForm
      mode={mode}
      initialData={initialData}
      gymName={gymName}
      cancelHref={cancelHref}
      successHref={cancelHref}
      onSubmit={(input) =>
        mode === "edit" && branchId
          ? updateAdminGymBranch(gymId, branchId, input)
          : createAdminGymBranch(gymId, input)
      }
    />
  );
}

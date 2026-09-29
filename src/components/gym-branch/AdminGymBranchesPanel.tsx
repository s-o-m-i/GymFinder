"use client";

import {
  deleteAdminGymBranch,
  setAdminGymBranchStatus,
  setAdminPrimaryGymBranch,
} from "@/app/actions/admin/gym-branches";
import {
  GymBranchesPanel,
  type GymBranchListItem,
} from "@/components/gym-branch/GymBranchesPanel";

interface AdminGymBranchesPanelProps {
  gymId: string;
  gymName: string;
  gymSlug: string;
  branches: GymBranchListItem[];
}

export function AdminGymBranchesPanel({
  gymId,
  gymName,
  gymSlug,
  branches,
}: AdminGymBranchesPanelProps) {
  return (
    <GymBranchesPanel
      gymName={gymName}
      gymSlug={gymSlug}
      branches={branches}
      addHref={`/admin/edit-gym/${gymId}/branches/new`}
      editHref={(branchId) => `/admin/edit-gym/${gymId}/branches/${branchId}`}
      onSetStatus={(branchId, status) =>
        setAdminGymBranchStatus(gymId, branchId, status)
      }
      onSetPrimary={(branchId) => setAdminPrimaryGymBranch(gymId, branchId)}
      onDelete={(branchId) => deleteAdminGymBranch(gymId, branchId)}
    />
  );
}

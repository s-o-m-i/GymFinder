"use client";

import {
  deleteOwnerGymBranch,
  setOwnerGymBranchStatus,
  setOwnerPrimaryGymBranch,
} from "@/app/actions/owner/gym-branches";
import {
  GymBranchesPanel,
  type GymBranchListItem,
} from "@/components/gym-branch/GymBranchesPanel";

interface OwnerGymBranchesPanelProps {
  gymName: string;
  gymSlug: string;
  branches: GymBranchListItem[];
}

export function OwnerGymBranchesPanel({
  gymName,
  gymSlug,
  branches,
}: OwnerGymBranchesPanelProps) {
  return (
    <GymBranchesPanel
      gymName={gymName}
      gymSlug={gymSlug}
      branches={branches}
      addHref="/owner/branches/new"
      editHref={(branchId) => `/owner/branches/${branchId}`}
      onSetStatus={(branchId, status) => setOwnerGymBranchStatus(branchId, status)}
      onSetPrimary={(branchId) => setOwnerPrimaryGymBranch(branchId)}
      onDelete={(branchId) => deleteOwnerGymBranch(branchId)}
    />
  );
}

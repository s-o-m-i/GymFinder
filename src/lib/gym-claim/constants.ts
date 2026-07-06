import type { GymClaimPosition, GymClaimStatus } from "@prisma/client";

export const GYM_CLAIM_POSITION_LABELS: Record<GymClaimPosition, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  PARTNER: "Partner",
  MARKETING_MANAGER: "Marketing Manager",
  OTHER: "Other",
};

export const GYM_CLAIM_STATUS_LABELS: Record<GymClaimStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const GYM_CLAIM_STATUS_STYLES: Record<GymClaimStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-50 text-red-800 border-red-200",
};

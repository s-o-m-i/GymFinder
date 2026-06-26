import type { UploadedImage } from "@/lib/gym-images-form";
import type { StaffAchievementItem, StaffCertificationItem } from "@/lib/staff-members";
import type { TrainerAvailabilitySlot } from "@/lib/trainer-availability";
import type { TrainerProfileFormValues } from "@/components/trainers/profile-wizard/types";

export const TRAINER_PROFILE_DRAFT_VERSION = 1;

export interface TrainerProfileDraft {
  version: typeof TRAINER_PROFILE_DRAFT_VERSION;
  savedAt: string;
  currentStep: number;
  values: TrainerProfileFormValues;
  photo: Pick<UploadedImage, "imageUrl" | "publicId" | "status" | "progress">[];
}

export function getTrainerProfileDraftKey(accountEmail: string) {
  return `trainer-profile-draft:${accountEmail.toLowerCase()}`;
}

export function loadTrainerProfileDraft(accountEmail: string): TrainerProfileDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getTrainerProfileDraftKey(accountEmail));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TrainerProfileDraft;
    if (parsed.version !== TRAINER_PROFILE_DRAFT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTrainerProfileDraft(
  accountEmail: string,
  draft: Omit<TrainerProfileDraft, "version" | "savedAt">
) {
  if (typeof window === "undefined") return;
  const payload: TrainerProfileDraft = {
    version: TRAINER_PROFILE_DRAFT_VERSION,
    savedAt: new Date().toISOString(),
    ...draft,
  };
  localStorage.setItem(getTrainerProfileDraftKey(accountEmail), JSON.stringify(payload));
}

export function clearTrainerProfileDraft(accountEmail: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getTrainerProfileDraftKey(accountEmail));
}

export function draftPhotoToUploadedImages(
  photo: TrainerProfileDraft["photo"]
): UploadedImage[] {
  return photo
    .filter((p) => p.imageUrl)
    .map((p) => ({
      imageUrl: p.imageUrl!,
      publicId: p.publicId,
      status: (p.status ?? "uploaded") as UploadedImage["status"],
      progress: p.progress ?? 100,
    }));
}

export type { StaffAchievementItem, StaffCertificationItem, TrainerAvailabilitySlot };

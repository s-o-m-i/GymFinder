import type { UploadedImage } from "@/lib/gym-images-form";
import type { TrainerProfileFormValues } from "@/components/trainers/profile-wizard/types";

export interface ProfileCompletionField {
  key: string;
  label: string;
  filled: boolean;
  recommended: boolean;
}

export interface ProfileCompletionResult {
  percentage: number;
  fields: ProfileCompletionField[];
  missingRecommended: ProfileCompletionField[];
}

const RECOMMENDED_CHECKS: {
  key: string;
  label: string;
  check: (values: TrainerProfileFormValues, hasPhoto: boolean) => boolean;
}[] = [
  { key: "fullName", label: "Full name", check: (v) => v.fullName.trim().length >= 2 },
  { key: "city", label: "City", check: (v) => Boolean(v.city) },
  { key: "whatsappNumber", label: "WhatsApp number", check: (v) => v.whatsappNumber.trim().length >= 10 },
  { key: "profilePhoto", label: "Profile photo", check: (_, hasPhoto) => hasPhoto },
  { key: "headline", label: "Headline", check: (v) => Boolean(v.headline?.trim()) },
  { key: "area", label: "Area", check: (v) => Boolean(v.area?.trim()) },
  { key: "bio", label: "Bio", check: (v) => Boolean(v.bio?.trim()) },
  { key: "experienceYears", label: "Experience", check: (v) => Boolean(v.experienceYears) },
  { key: "hourlyRate", label: "Hourly rate", check: (v) => Boolean(v.hourlyRate) },
  { key: "achievements", label: "Achievements", check: (v) => v.achievements.length > 0 },
  { key: "certifications", label: "Certifications", check: (v) => v.certifications.length > 0 },
  {
    key: "availabilitySlots",
    label: "Availability slots",
    check: (v) => v.availabilitySlots.length > 0,
  },
];

const REQUIRED_KEYS = new Set(["fullName", "city", "whatsappNumber"]);

export function calculateProfileCompletion(
  values: TrainerProfileFormValues,
  photo: UploadedImage[]
): ProfileCompletionResult {
  const hasPhoto = photo.some((p) => p.status === "uploaded" && p.imageUrl);

  const fields: ProfileCompletionField[] = RECOMMENDED_CHECKS.map(({ key, label, check }) => ({
    key,
    label,
    filled: check(values, hasPhoto),
    recommended: !REQUIRED_KEYS.has(key),
  }));

  const filledCount = fields.filter((f) => f.filled).length;
  const percentage = Math.round((filledCount / fields.length) * 100);

  return {
    percentage,
    fields,
    missingRecommended: fields.filter((f) => f.recommended && !f.filled),
  };
}

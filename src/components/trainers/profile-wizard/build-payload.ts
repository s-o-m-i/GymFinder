import type { UploadedImage } from "@/lib/gym-images-form";
import type { TrainerProfileFormValues } from "@/components/trainers/profile-wizard/types";

export function buildTrainerProfilePayload(
  values: TrainerProfileFormValues,
  photo: UploadedImage[]
) {
  const uploadedPhoto = photo.find((p) => p.status === "uploaded");

  return {
    fullName: values.fullName,
    headline: values.headline || null,
    bio: values.bio || null,
    city: values.city,
    area: values.area || null,
    specialization: values.specialization || null,
    experienceYears: values.experienceYears ? Number(values.experienceYears) : null,
    hourlyRate: values.hourlyRate ? Number(values.hourlyRate) : null,
    whatsappNumber: values.whatsappNumber,
    email: values.email || null,
    gender: (values.gender || null) as "male" | "female" | "other" | null,
    gymId: values.gymId || null,
    isPublished: values.isPublished,
    profileImage: uploadedPhoto?.imageUrl ?? null,
    cloudinaryId: uploadedPhoto?.publicId ?? null,
    certifications: values.certifications,
    achievements: values.achievements,
    availabilitySlots: values.availabilitySlots,
  };
}

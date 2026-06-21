import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/cloudinary";
import type { AdminTrainerInput } from "@/lib/validations/admin-trainer";
import { generateUniqueTrainerSlug } from "@/services/trainer/trainer.service";
import {
  diffRemovedCloudinaryIds,
  serializeAchievements,
  serializeCertifications,
} from "@/lib/staff-members";
import {
  serializeTrainerAvailability,
  type TrainerAvailabilitySlot,
} from "@/lib/trainer-availability";

function buildTrainerPayload(data: AdminTrainerInput, emailFallback?: string | null) {
  const certificationsJson = serializeCertifications(data.certifications);
  const achievementsJson = serializeAchievements(data.achievements);
  const availabilityJson = serializeTrainerAvailability(
    data.availabilitySlots as TrainerAvailabilitySlot[]
  );

  return {
    fullName: data.fullName.trim(),
    headline: data.headline?.trim() || null,
    bio: data.bio?.trim() || null,
    city: data.city,
    area: data.area?.trim() || null,
    specialization: data.specialization || null,
    experienceYears: data.experienceYears ?? null,
    certifications: certificationsJson,
    achievements: achievementsJson,
    hourlyRate: data.hourlyRate ?? null,
    whatsappNumber: data.whatsappNumber.trim(),
    email: data.email?.trim() || emailFallback || null,
    gender: data.gender || null,
    availability: availabilityJson,
    gymId: data.gymId || null,
    profileImage: data.profileImage,
    cloudinaryId: data.cloudinaryId,
    isPublished: data.isPublished ?? false,
    isVerified: data.isVerified ?? false,
    isFeatured: data.isFeatured ?? false,
  };
}

async function cleanupRemovedImages(
  existing: {
    certifications: string | null;
    cloudinaryId: string | null;
  },
  nextCertificationsJson: string | null,
  nextCloudinaryId: string | null
) {
  const removedCertIds = diffRemovedCloudinaryIds(
    existing.certifications,
    nextCertificationsJson
  );
  for (const publicId of removedCertIds) {
    try {
      await deleteImage(publicId);
    } catch {
      // Best-effort cleanup
    }
  }

  if (existing.cloudinaryId && existing.cloudinaryId !== nextCloudinaryId) {
    try {
      await deleteImage(existing.cloudinaryId);
    } catch {
      // Best-effort cleanup
    }
  }
}

export async function createTrainerByAdmin(data: AdminTrainerInput) {
  const payload = buildTrainerPayload(data);
  const slug = await generateUniqueTrainerSlug(data.fullName, data.city);

  return prisma.trainer.create({
    data: { ...payload, slug },
  });
}

export async function updateTrainerByAdmin(trainerId: string, data: AdminTrainerInput) {
  const existing = await prisma.trainer.findUnique({ where: { id: trainerId } });
  if (!existing) return null;

  const payload = buildTrainerPayload(data, existing.email);

  const trainer = await prisma.trainer.update({
    where: { id: trainerId },
    data: payload,
  });

  await cleanupRemovedImages(
    existing,
    payload.certifications,
    payload.cloudinaryId
  );

  return trainer;
}

export async function updateTrainerStatusByAdmin(
  trainerId: string,
  patch: { isPublished?: boolean; isVerified?: boolean; isFeatured?: boolean }
) {
  return prisma.trainer.update({
    where: { id: trainerId },
    data: patch,
  });
}

export async function getAdminTrainersList() {
  return prisma.trainer.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      fullName: true,
      slug: true,
      city: true,
      area: true,
      specialization: true,
      isPublished: true,
      isVerified: true,
      isFeatured: true,
      rating: true,
      totalReviews: true,
      whatsappNumber: true,
      createdAt: true,
      gym: {
        select: { id: true, name: true },
      },
      account: {
        select: { email: true },
      },
    },
  });
}

export async function getAdminTrainerById(id: string) {
  return prisma.trainer.findUnique({
    where: { id },
    include: {
      gym: { select: { id: true, name: true, city: true } },
      account: { select: { email: true } },
    },
  });
}

export async function getApprovedGymsForTrainerForm() {
  return prisma.gym.findMany({
    where: { listingStatus: "approved" },
    select: { id: true, name: true, city: true, area: true },
    orderBy: [{ city: "asc" }, { name: "asc" }],
  });
}

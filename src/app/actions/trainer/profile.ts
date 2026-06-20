"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/cloudinary";
import {
  getTrainerSession,
  signTrainerToken,
  TRAINER_COOKIE_MAX_AGE,
  TRAINER_COOKIE_NAME,
} from "@/lib/trainer-auth";
import { trainerProfileSchema } from "@/lib/validations/trainer";
import { generateUniqueTrainerSlug } from "@/services/trainer/trainer.service";
import {
  diffRemovedCloudinaryIds,
  serializeAchievements,
  serializeCertifications,
} from "@/lib/staff-members";
import { serializeTrainerAvailability } from "@/lib/trainer-availability";
import type { TrainerAvailabilitySlot } from "@/lib/trainer-availability";
import { cookies } from "next/headers";

export async function saveTrainerProfile(input: unknown) {
  const session = await getTrainerSession();
  if (!session) {
    return { success: false as const, error: "Not signed in." };
  }

  const parsed = trainerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const data = parsed.data;
  const account = await prisma.trainerAccount.findUnique({
    where: { id: session.accountId },
    include: { trainer: true },
  });

  if (!account) {
    return { success: false as const, error: "Account not found." };
  }

  const certificationsJson = serializeCertifications(data.certifications);
  const achievementsJson = serializeAchievements(data.achievements);
  const availabilityJson = serializeTrainerAvailability(
    data.availabilitySlots as TrainerAvailabilitySlot[]
  );

  const payload = {
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
    email: data.email?.trim() || account.email,
    gender: data.gender || null,
    availability: availabilityJson,
    gymId: data.gymId || null,
    profileImage: data.profileImage,
    cloudinaryId: data.cloudinaryId,
    isPublished: data.isPublished ?? true,
    accountId: account.id,
  };

  const existing = account.trainer;

  let trainer;
  if (existing) {
    trainer = await prisma.trainer.update({
      where: { id: existing.id },
      data: payload,
    });

    const removedCertIds = diffRemovedCloudinaryIds(
      existing.certifications,
      certificationsJson
    );
    for (const publicId of removedCertIds) {
      try {
        await deleteImage(publicId);
      } catch {
        // Best-effort cleanup
      }
    }

    if (
      existing.cloudinaryId &&
      existing.cloudinaryId !== data.cloudinaryId
    ) {
      try {
        await deleteImage(existing.cloudinaryId);
      } catch {
        // Best-effort cleanup
      }
    }
  } else {
    const slug = await generateUniqueTrainerSlug(data.fullName, data.city);
    trainer = await prisma.trainer.create({
      data: { ...payload, slug },
    });
  }

  const token = await signTrainerToken({
    accountId: account.id,
    email: account.email,
    trainerId: trainer.id,
  });

  const cookieStore = await cookies();
  cookieStore.set(TRAINER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TRAINER_COOKIE_MAX_AGE,
    path: "/",
  });

  revalidatePath("/trainers");
  revalidatePath(`/trainer/${trainer.slug}`);
  revalidatePath("/trainer/dashboard");

  return {
    success: true as const,
    trainerId: trainer.id,
    slug: trainer.slug,
  };
}

export async function unpublishTrainerProfile() {
  const session = await getTrainerSession();
  if (!session?.trainerId) {
    return { success: false as const, error: "No trainer profile found." };
  }

  await prisma.trainer.update({
    where: { id: session.trainerId },
    data: { isPublished: false },
  });

  revalidatePath("/trainers");
  revalidatePath("/trainer/dashboard");

  return { success: true as const };
}

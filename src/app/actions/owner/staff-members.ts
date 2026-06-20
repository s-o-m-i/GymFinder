"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/cloudinary";
import { getOwnerSession } from "@/lib/owner-auth";
import {
  flattenZodErrors,
  reorderStaffSchema,
  staffMemberFormSchema,
  type StaffMemberFormInput,
} from "@/lib/validations/staff-member";
import {
  collectCertificationCloudinaryIds,
  diffRemovedCloudinaryIds,
} from "@/lib/staff-members";

export type StaffActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function requireOwnerGym() {
  const session = await getOwnerSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.ownerId },
    select: { id: true, slug: true },
  });

  if (!gym) {
    throw new Error("NO_LISTING");
  }

  return { session, gym };
}

function actionError(message: string, fieldErrors?: Record<string, string>): StaffActionResult<never> {
  return { success: false, error: message, fieldErrors };
}

async function getOwnedStaffMember(gymId: string, staffId: string) {
  return prisma.staffMember.findFirst({
    where: { id: staffId, gymId },
  });
}

function revalidateStaffPaths(slug: string) {
  revalidatePath("/owner/team");
  revalidatePath(`/gyms/${slug}`);
}

export async function createStaffMember(
  input: StaffMemberFormInput
): Promise<StaffActionResult<{ id: string }>> {
  try {
    const { gym } = await requireOwnerGym();
    const parsed = staffMemberFormSchema.safeParse(input);

    if (!parsed.success) {
      return actionError("Please fix the errors below.", flattenZodErrors(parsed.error));
    }

    const maxOrder = await prisma.staffMember.aggregate({
      where: { gymId: gym.id },
      _max: { displayOrder: true },
    });

    const member = await prisma.staffMember.create({
      data: {
        gymId: gym.id,
        ...parsed.data,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      },
    });

    revalidateStaffPaths(gym.slug);
    return { success: true, data: { id: member.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_LISTING") {
      return actionError("Create your listing first before adding team members.");
    }
    console.error("createStaffMember error:", err);
    return actionError("Failed to create team member.");
  }
}

export async function updateStaffMember(
  staffId: string,
  input: StaffMemberFormInput
): Promise<StaffActionResult<{ id: string }>> {
  try {
    const { gym } = await requireOwnerGym();
    const existing = await getOwnedStaffMember(gym.id, staffId);

    if (!existing) {
      return actionError("Team member not found.");
    }

    const parsed = staffMemberFormSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("Please fix the errors below.", flattenZodErrors(parsed.error));
    }

    const oldCloudinaryId = existing.cloudinaryId;
    const newCloudinaryId = parsed.data.cloudinaryId;

    const member = await prisma.staffMember.update({
      where: { id: staffId },
      data: parsed.data,
    });

    const removedCertIds = diffRemovedCloudinaryIds(
      existing.certifications,
      parsed.data.certifications
    );
    for (const publicId of removedCertIds) {
      try {
        await deleteImage(publicId);
      } catch {
        // Best-effort cleanup
      }
    }

    if (
      oldCloudinaryId &&
      oldCloudinaryId !== newCloudinaryId &&
      parsed.data.profileImage !== existing.profileImage
    ) {
      try {
        await deleteImage(oldCloudinaryId);
      } catch {
        // Best-effort cleanup
      }
    }

    revalidateStaffPaths(gym.slug);
    return { success: true, data: { id: member.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_LISTING") {
      return actionError("No listing found.");
    }
    console.error("updateStaffMember error:", err);
    return actionError("Failed to update team member.");
  }
}

export async function deleteStaffMember(staffId: string): Promise<StaffActionResult> {
  try {
    const { gym } = await requireOwnerGym();
    const existing = await getOwnedStaffMember(gym.id, staffId);

    if (!existing) {
      return actionError("Team member not found.");
    }

    await prisma.staffMember.delete({ where: { id: staffId } });

    const certImageIds = collectCertificationCloudinaryIds(existing.certifications);
    for (const publicId of certImageIds) {
      try {
        await deleteImage(publicId);
      } catch {
        // Best-effort cleanup
      }
    }

    if (existing.cloudinaryId) {
      try {
        await deleteImage(existing.cloudinaryId);
      } catch {
        // Best-effort cleanup
      }
    }

    revalidateStaffPaths(gym.slug);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_LISTING") {
      return actionError("No listing found.");
    }
    console.error("deleteStaffMember error:", err);
    return actionError("Failed to delete team member.");
  }
}

export async function reorderStaffMembers(
  orderedIds: string[]
): Promise<StaffActionResult> {
  try {
    const { gym } = await requireOwnerGym();
    const parsed = reorderStaffSchema.safeParse({ orderedIds });

    if (!parsed.success) {
      return actionError("Invalid reorder request.", flattenZodErrors(parsed.error));
    }

    const members = await prisma.staffMember.findMany({
      where: { gymId: gym.id },
      select: { id: true },
    });

    const memberIds = new Set(members.map((m) => m.id));
    if (
      parsed.data.orderedIds.length !== members.length ||
      !parsed.data.orderedIds.every((id) => memberIds.has(id))
    ) {
      return actionError("Invalid team member order.");
    }

    await prisma.$transaction(
      parsed.data.orderedIds.map((id, index) =>
        prisma.staffMember.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    );

    revalidateStaffPaths(gym.slug);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_LISTING") {
      return actionError("No listing found.");
    }
    console.error("reorderStaffMembers error:", err);
    return actionError("Failed to reorder team members.");
  }
}

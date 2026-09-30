"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  flattenGymBranchZodErrors,
  gymBranchFormSchema,
  gymBranchStatusSchema,
  type GymBranchFormInput,
} from "@/lib/validations/gym-branch";
import {
  persistGymBranchFromParsed,
  deleteGymBranchRecord,
  setPrimaryGymBranchRecord,
} from "@/lib/gym-branches";
import { getGymBranchPath } from "@/lib/gym-branch-rules";

export type GymBranchActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function requireAdmin() {
  const ok = await getAdminSession();
  if (!ok) throw new Error("UNAUTHORIZED");
}

async function getGymForBranches(gymId: string) {
  return prisma.gym.findUnique({
    where: { id: gymId },
    select: { id: true, slug: true, name: true },
  });
}

function actionError(
  message: string,
  fieldErrors?: Record<string, string>
): GymBranchActionResult<never> {
  return { success: false, error: message, fieldErrors };
}

function revalidateBranchPaths(gymId: string, gymSlug: string, listingSlug?: string | null) {
  revalidatePath("/admin");
  revalidatePath("/gyms");
  revalidatePath(`/admin/edit-gym/${gymId}`);
  revalidatePath(`/admin/edit-gym/${gymId}/branches/new`);
  revalidatePath(`/gyms/${gymSlug}`);
  if (listingSlug) {
    revalidatePath(getGymBranchPath(listingSlug));
  }
}

function catchBranchError(err: unknown, fallback: string): GymBranchActionResult<never> {
  if (err instanceof Error && err.message === "UNAUTHORIZED") {
    return actionError("You must be signed in as an admin.");
  }
  if (err instanceof Error && err.message === "BRANCH_NOT_FOUND") {
    return actionError("Branch not found.");
  }
  if (err instanceof Error && err.message === "GYM_NOT_FOUND") {
    return actionError("Gym not found.");
  }
  if (
    err instanceof Error &&
    (err.message.includes("cannot be deleted") ||
      err.message.includes("primary branch"))
  ) {
    return actionError(err.message);
  }
  console.error(fallback, err);
  return actionError(fallback);
}

export async function createAdminGymBranch(
  gymId: string,
  input: GymBranchFormInput
): Promise<GymBranchActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
    const gym = await getGymForBranches(gymId);
    if (!gym) return actionError("Gym not found.");

    const parsed = gymBranchFormSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(
        "Please fix the errors below.",
        flattenGymBranchZodErrors(parsed.error)
      );
    }

    const branch = await persistGymBranchFromParsed(gymId, parsed.data);

    revalidateBranchPaths(gym.id, gym.slug, branch.listingSlug);
    return { success: true, data: { id: branch.id, slug: branch.slug } };
  } catch (err) {
    return catchBranchError(err, "Failed to create branch.");
  }
}

export async function updateAdminGymBranch(
  gymId: string,
  branchId: string,
  input: GymBranchFormInput
): Promise<GymBranchActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
    const gym = await getGymForBranches(gymId);
    if (!gym) return actionError("Gym not found.");

    const parsed = gymBranchFormSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(
        "Please fix the errors below.",
        flattenGymBranchZodErrors(parsed.error)
      );
    }

    const branch = await persistGymBranchFromParsed(gymId, parsed.data, branchId);

    revalidateBranchPaths(gym.id, gym.slug, branch.listingSlug);
    return { success: true, data: { id: branch.id, slug: branch.slug } };
  } catch (err) {
    return catchBranchError(err, "Failed to update branch.");
  }
}

export async function setAdminGymBranchStatus(
  gymId: string,
  branchId: string,
  status: string
): Promise<GymBranchActionResult> {
  try {
    await requireAdmin();
    const gym = await getGymForBranches(gymId);
    if (!gym) return actionError("Gym not found.");

    const parsed = gymBranchStatusSchema.safeParse({ status });
    if (!parsed.success) {
      return actionError("Invalid branch status.");
    }

    const existing = await prisma.gymBranch.findFirst({
      where: { id: branchId, gymId },
      select: { slug: true, listingSlug: true },
    });
    if (!existing) return actionError("Branch not found.");

    await prisma.gymBranch.update({
      where: { id: branchId },
      data: { status: parsed.data.status },
    });

    revalidateBranchPaths(gym.id, gym.slug, existing.listingSlug);
    return { success: true, data: undefined };
  } catch (err) {
    return catchBranchError(err, "Failed to update branch status.");
  }
}

export async function setAdminPrimaryGymBranch(
  gymId: string,
  branchId: string
): Promise<GymBranchActionResult> {
  try {
    await requireAdmin();
    const gym = await getGymForBranches(gymId);
    if (!gym) return actionError("Gym not found.");

    const branch = await prisma.$transaction((tx) =>
      setPrimaryGymBranchRecord(gymId, branchId, tx)
    );

    revalidateBranchPaths(gym.id, gym.slug, branch.listingSlug);
    return { success: true, data: undefined };
  } catch (err) {
    return catchBranchError(err, "Failed to set primary branch.");
  }
}

export async function deleteAdminGymBranch(
  gymId: string,
  branchId: string
): Promise<GymBranchActionResult> {
  try {
    await requireAdmin();
    const gym = await getGymForBranches(gymId);
    if (!gym) return actionError("Gym not found.");

    const existing = await prisma.gymBranch.findFirst({
      where: { id: branchId, gymId },
      select: { slug: true, listingSlug: true },
    });
    if (!existing) return actionError("Branch not found.");

    await prisma.$transaction((tx) =>
      deleteGymBranchRecord(gymId, branchId, tx)
    );

    revalidateBranchPaths(gym.id, gym.slug, existing.listingSlug);
    return { success: true, data: undefined };
  } catch (err) {
    return catchBranchError(err, "Failed to delete branch.");
  }
}

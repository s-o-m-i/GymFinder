"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-auth";
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

export type OwnerGymBranchActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function requireOwnerGym() {
  const session = await getOwnerSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.ownerId },
    select: { id: true, slug: true, name: true },
  });

  if (!gym) throw new Error("NO_LISTING");
  return { session, gym };
}

function actionError(
  message: string,
  fieldErrors?: Record<string, string>
): OwnerGymBranchActionResult<never> {
  return { success: false, error: message, fieldErrors };
}

function revalidateOwnerBranchPaths(gymSlug: string, branchSlug?: string) {
  revalidatePath("/owner/branches");
  revalidatePath("/owner/common");
  revalidatePath("/owner/gym");
  revalidatePath("/gyms");
  revalidatePath(`/gyms/${gymSlug}`);
  if (branchSlug) {
    revalidatePath(getGymBranchPath(gymSlug, branchSlug));
  }
}

function catchOwnerBranchError(
  err: unknown,
  fallback: string
): OwnerGymBranchActionResult<never> {
  if (err instanceof Error && err.message === "UNAUTHORIZED") {
    return actionError("You must be logged in.");
  }
  if (err instanceof Error && err.message === "NO_LISTING") {
    return actionError("Create your listing first.");
  }
  if (err instanceof Error && err.message === "BRANCH_NOT_FOUND") {
    return actionError("Branch not found.");
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

export async function createOwnerGymBranch(
  input: GymBranchFormInput
): Promise<OwnerGymBranchActionResult<{ id: string; slug: string }>> {
  try {
    const { gym } = await requireOwnerGym();
    const parsed = gymBranchFormSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(
        "Please fix the errors below.",
        flattenGymBranchZodErrors(parsed.error)
      );
    }

    const branch = await persistGymBranchFromParsed(gym.id, parsed.data);

    revalidateOwnerBranchPaths(gym.slug, branch.slug);
    return { success: true, data: { id: branch.id, slug: branch.slug } };
  } catch (err) {
    return catchOwnerBranchError(err, "Failed to create branch.");
  }
}

export async function updateOwnerGymBranch(
  branchId: string,
  input: GymBranchFormInput
): Promise<OwnerGymBranchActionResult<{ id: string; slug: string }>> {
  try {
    const { gym } = await requireOwnerGym();
    const parsed = gymBranchFormSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(
        "Please fix the errors below.",
        flattenGymBranchZodErrors(parsed.error)
      );
    }

    const owned = await prisma.gymBranch.findFirst({
      where: { id: branchId, gymId: gym.id },
      select: { id: true },
    });
    if (!owned) return actionError("Branch not found.");

    const branch = await persistGymBranchFromParsed(gym.id, parsed.data, branchId);

    revalidateOwnerBranchPaths(gym.slug, branch.slug);
    return { success: true, data: { id: branch.id, slug: branch.slug } };
  } catch (err) {
    return catchOwnerBranchError(err, "Failed to update branch.");
  }
}

export async function setOwnerGymBranchStatus(
  branchId: string,
  status: string
): Promise<OwnerGymBranchActionResult> {
  try {
    const { gym } = await requireOwnerGym();
    const parsed = gymBranchStatusSchema.safeParse({ status });
    if (!parsed.success) {
      return actionError("Invalid branch status.");
    }

    const existing = await prisma.gymBranch.findFirst({
      where: { id: branchId, gymId: gym.id },
      select: { slug: true },
    });
    if (!existing) return actionError("Branch not found.");

    await prisma.gymBranch.update({
      where: { id: branchId },
      data: { status: parsed.data.status },
    });

    revalidateOwnerBranchPaths(gym.slug, existing.slug);
    return { success: true, data: undefined };
  } catch (err) {
    return catchOwnerBranchError(err, "Failed to update branch status.");
  }
}

export async function setOwnerPrimaryGymBranch(
  branchId: string
): Promise<OwnerGymBranchActionResult> {
  try {
    const { gym } = await requireOwnerGym();
    const branch = await prisma.$transaction((tx) =>
      setPrimaryGymBranchRecord(gym.id, branchId, tx)
    );
    revalidateOwnerBranchPaths(gym.slug, branch.slug);
    return { success: true, data: undefined };
  } catch (err) {
    return catchOwnerBranchError(err, "Failed to set primary branch.");
  }
}

export async function deleteOwnerGymBranch(
  branchId: string
): Promise<OwnerGymBranchActionResult> {
  try {
    const { gym } = await requireOwnerGym();
    const existing = await prisma.gymBranch.findFirst({
      where: { id: branchId, gymId: gym.id },
      select: { slug: true },
    });
    if (!existing) return actionError("Branch not found.");

    await prisma.$transaction((tx) =>
      deleteGymBranchRecord(gym.id, branchId, tx)
    );

    revalidateOwnerBranchPaths(gym.slug, existing.slug);
    return { success: true, data: undefined };
  } catch (err) {
    return catchOwnerBranchError(err, "Failed to delete branch.");
  }
}

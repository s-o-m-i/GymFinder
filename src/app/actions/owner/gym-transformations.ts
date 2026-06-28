"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/cloudinary";
import { getOwnerSession } from "@/lib/owner-auth";
import {
  diffRemovedTransformationCloudinaryIds,
  serializeTransformations,
  type TransformationItem,
} from "@/lib/transformations";
import {
  flattenTransformationZodErrors,
  transformationsSchema,
} from "@/lib/validations/transformations";

export type TransformationsActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function updateGymTransformations(
  items: TransformationItem[]
): Promise<TransformationsActionResult> {
  try {
    const session = await getOwnerSession();
    if (!session) {
      return { success: false, error: "You must be logged in." };
    }

    const gym = await prisma.gym.findUnique({
      where: { ownerId: session.ownerId },
      select: { id: true, slug: true, transformations: true },
    });

    if (!gym) {
      return {
        success: false,
        error: "Create your listing first before adding transformations.",
      };
    }

    const parsed = transformationsSchema.safeParse(items);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please fix the errors below.",
        fieldErrors: flattenTransformationZodErrors(parsed.error),
      };
    }

    const nextJson = serializeTransformations(parsed.data);
    const removedIds = diffRemovedTransformationCloudinaryIds(gym.transformations, nextJson);
    for (const publicId of removedIds) {
      try {
        await deleteImage(publicId);
      } catch {
        // best-effort cleanup
      }
    }

    await prisma.gym.update({
      where: { id: gym.id },
      data: { transformations: nextJson },
    });

    revalidatePath("/owner/transformations");
    revalidatePath(`/gyms/${gym.slug}`);

    return { success: true };
  } catch (err) {
    console.error("updateGymTransformations error:", err);
    return { success: false, error: "Failed to save transformations." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/cloudinary";
import { getTrainerSession } from "@/lib/trainer-auth";
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

export async function updateTrainerTransformations(
  items: TransformationItem[]
): Promise<TransformationsActionResult> {
  try {
    const session = await getTrainerSession();
    if (!session?.trainerId) {
      return { success: false, error: "Create your profile first." };
    }

    const trainer = await prisma.trainer.findUnique({
      where: { id: session.trainerId },
      select: { id: true, slug: true, transformations: true },
    });

    if (!trainer) {
      return { success: false, error: "Trainer profile not found." };
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
    const removedIds = diffRemovedTransformationCloudinaryIds(
      trainer.transformations,
      nextJson
    );
    for (const publicId of removedIds) {
      try {
        await deleteImage(publicId);
      } catch {
        // best-effort cleanup
      }
    }

    await prisma.trainer.update({
      where: { id: trainer.id },
      data: { transformations: nextJson },
    });

    revalidatePath("/trainer/dashboard/transformations");
    revalidatePath(`/trainer/${trainer.slug}`);

    return { success: true };
  } catch (err) {
    console.error("updateTrainerTransformations error:", err);
    return { success: false, error: "Failed to save transformations." };
  }
}

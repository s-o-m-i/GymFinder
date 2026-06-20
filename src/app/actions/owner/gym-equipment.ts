"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-auth";
import { serializeGymEquipment, type GymEquipmentItem } from "@/lib/gym-equipment";
import {
  flattenZodErrors,
  gymEquipmentSchema,
} from "@/lib/validations/gym-equipment";

export type EquipmentActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function updateGymEquipment(
  items: GymEquipmentItem[]
): Promise<EquipmentActionResult> {
  try {
    const session = await getOwnerSession();
    if (!session) {
      return { success: false, error: "You must be logged in." };
    }

    const gym = await prisma.gym.findUnique({
      where: { ownerId: session.ownerId },
      select: { id: true, slug: true },
    });

    if (!gym) {
      return { success: false, error: "Create your listing first before adding equipment." };
    }

    const parsed = gymEquipmentSchema.safeParse(items);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please fix the errors below.",
        fieldErrors: flattenZodErrors(parsed.error),
      };
    }

    await prisma.gym.update({
      where: { id: gym.id },
      data: { equipment: serializeGymEquipment(parsed.data) },
    });

    revalidatePath("/owner/equipment");
    revalidatePath(`/gyms/${gym.slug}`);

    return { success: true };
  } catch (err) {
    console.error("updateGymEquipment error:", err);
    return { success: false, error: "Failed to save equipment list." };
  }
}

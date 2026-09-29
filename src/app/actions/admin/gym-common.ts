"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  gymCommonSettingsSchema,
  type GymCommonSettingsInput,
} from "@/lib/validations/gym-common";
import { persistGymCommonSettings } from "@/lib/gym-common-settings";
import { flattenGymBranchZodErrors } from "@/lib/validations/gym-branch";

export type AdminCommonSettingsResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function updateAdminGymCommonSettings(
  gymId: string,
  input: GymCommonSettingsInput
): Promise<AdminCommonSettingsResult> {
  try {
    const ok = await getAdminSession();
    if (!ok) return { success: false, error: "You must be signed in as an admin." };

    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: { id: true, slug: true },
    });
    if (!gym) return { success: false, error: "Gym not found." };

    const parsed = gymCommonSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please fix the errors below.",
        fieldErrors: flattenGymBranchZodErrors(parsed.error),
      };
    }

    await persistGymCommonSettings(gym.id, parsed.data);

    revalidatePath(`/admin/edit-gym/${gym.id}`);
    revalidatePath("/gyms");
    revalidatePath(`/gyms/${gym.slug}`);
    return { success: true };
  } catch (error) {
    console.error("updateAdminGymCommonSettings", error);
    return { success: false, error: "Failed to save common settings." };
  }
}

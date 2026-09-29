"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-auth";
import {
  gymCommonSettingsSchema,
  type GymCommonSettingsInput,
} from "@/lib/validations/gym-common";
import { persistGymCommonSettings } from "@/lib/gym-common-settings";
import { flattenGymBranchZodErrors } from "@/lib/validations/gym-branch";

export type OwnerCommonSettingsResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function updateOwnerGymCommonSettings(
  input: GymCommonSettingsInput
): Promise<OwnerCommonSettingsResult> {
  try {
    const session = await getOwnerSession();
    if (!session) return { success: false, error: "You must be logged in." };

    const gym = await prisma.gym.findUnique({
      where: { ownerId: session.ownerId },
      select: { id: true, slug: true },
    });
    if (!gym) return { success: false, error: "Create your listing first." };

    const parsed = gymCommonSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please fix the errors below.",
        fieldErrors: flattenGymBranchZodErrors(parsed.error),
      };
    }

    await persistGymCommonSettings(gym.id, parsed.data);

    revalidatePath("/owner/common");
    revalidatePath("/owner/branches");
    revalidatePath("/owner/gym");
    revalidatePath("/gyms");
    revalidatePath(`/gyms/${gym.slug}`);
    return { success: true };
  } catch (error) {
    console.error("updateOwnerGymCommonSettings", error);
    return { success: false, error: "Failed to save common settings." };
  }
}

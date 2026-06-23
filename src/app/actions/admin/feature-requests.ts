"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  approveFeatureRequest,
  rejectFeatureRequest,
  REVALIDATE_PATHS,
} from "@/services/featured/featured-gym.service";

export type AdminFeatureRequestActionResult =
  | { success: true }
  | { success: false; error: string };

function revalidateAll(slug?: string) {
  for (const path of REVALIDATE_PATHS) revalidatePath(path);
  revalidatePath("/admin/featured-plans");
  if (slug) revalidatePath(`/gyms/${slug}`);
}

export async function approveFeatureRequestAction(
  requestId: string
): Promise<AdminFeatureRequestActionResult> {
  try {
    const result = await approveFeatureRequest(requestId);
    revalidateAll(result.gymSlug);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "REQUEST_NOT_FOUND") {
      return { success: false, error: "Request not found." };
    }
    if (err instanceof Error && err.message === "REQUEST_NOT_PENDING") {
      return { success: false, error: "This request was already reviewed." };
    }
    console.error("approveFeatureRequestAction error:", err);
    return { success: false, error: "Failed to approve request." };
  }
}

export async function rejectFeatureRequestAction(
  requestId: string
): Promise<AdminFeatureRequestActionResult> {
  try {
    await rejectFeatureRequest(requestId);
    revalidateAll();
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "REQUEST_NOT_FOUND") {
      return { success: false, error: "Request not found." };
    }
    if (err instanceof Error && err.message === "REQUEST_NOT_PENDING") {
      return { success: false, error: "This request was already reviewed." };
    }
    console.error("rejectFeatureRequestAction error:", err);
    return { success: false, error: "Failed to reject request." };
  }
}

export async function deleteFeaturedPlanAction(planId: string): Promise<AdminFeatureRequestActionResult> {
  try {
    const linked = await prisma.featureRequest.count({ where: { planId } });
    if (linked > 0) {
      await prisma.featuredPlan.update({
        where: { id: planId },
        data: { isActive: false },
      });
    } else {
      await prisma.featuredPlan.delete({ where: { id: planId } });
    }
    revalidatePath("/admin/featured-plans");
    revalidatePath("/owner/featured");
    return { success: true };
  } catch (err) {
    console.error("deleteFeaturedPlanAction error:", err);
    return { success: false, error: "Failed to remove plan." };
  }
}

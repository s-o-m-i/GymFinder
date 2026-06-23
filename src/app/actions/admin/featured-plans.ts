"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  featuredPlanFormSchema,
  flattenFeaturedPlanErrors,
  type FeaturedPlanFormInput,
} from "@/lib/validations/featured-plan";

export type FeaturedPlanActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

function actionError(message: string, fieldErrors?: Record<string, string>): FeaturedPlanActionResult<never> {
  return { success: false, error: message, fieldErrors };
}

function revalidatePlanPaths() {
  revalidatePath("/admin/featured-plans");
  revalidatePath("/admin/featured-requests");
  revalidatePath("/owner/featured");
}

export async function createFeaturedPlanAction(
  input: FeaturedPlanFormInput
): Promise<FeaturedPlanActionResult<{ id: string }>> {
  try {
    const parsed = featuredPlanFormSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("Please fix the errors below.", flattenFeaturedPlanErrors(parsed.error));
    }

    const existing = await prisma.featuredPlan.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });
    if (existing) {
      return actionError("A plan with this slug already exists.", { slug: "Slug already in use" });
    }

    const plan = await prisma.featuredPlan.create({ data: parsed.data, select: { id: true } });
    revalidatePlanPaths();
    return { success: true, data: { id: plan.id } };
  } catch (err) {
    console.error("createFeaturedPlanAction error:", err);
    return actionError("Failed to create plan.");
  }
}

export async function updateFeaturedPlanAction(
  planId: string,
  input: FeaturedPlanFormInput
): Promise<FeaturedPlanActionResult> {
  try {
    const parsed = featuredPlanFormSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("Please fix the errors below.", flattenFeaturedPlanErrors(parsed.error));
    }

    const conflict = await prisma.featuredPlan.findFirst({
      where: { slug: parsed.data.slug, NOT: { id: planId } },
      select: { id: true },
    });
    if (conflict) {
      return actionError("A plan with this slug already exists.", { slug: "Slug already in use" });
    }

    await prisma.featuredPlan.update({ where: { id: planId }, data: parsed.data });
    revalidatePlanPaths();
    return { success: true, data: undefined };
  } catch (err) {
    console.error("updateFeaturedPlanAction error:", err);
    return actionError("Failed to update plan.");
  }
}

export async function toggleFeaturedPlanActiveAction(
  planId: string,
  isActive: boolean
): Promise<FeaturedPlanActionResult> {
  try {
    await prisma.featuredPlan.update({ where: { id: planId }, data: { isActive } });
    revalidatePlanPaths();
    return { success: true, data: undefined };
  } catch (err) {
    console.error("toggleFeaturedPlanActiveAction error:", err);
    return actionError("Failed to update plan status.");
  }
}

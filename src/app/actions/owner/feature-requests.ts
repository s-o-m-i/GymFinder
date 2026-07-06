"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-auth";
import {
  featureRequestSubmitSchema,
  flattenFeatureRequestErrors,
  type FeatureRequestSubmitInput,
} from "@/lib/validations/feature-request";
import { getFeaturedPlanById } from "@/services/featured/featured-plans.service";
import { REVALIDATE_PATHS } from "@/services/featured/featured-gym.service";

export type FeatureRequestActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function requireOwnerGym() {
  const session = await getOwnerSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.ownerId },
    select: { id: true, slug: true, name: true, featured: true, featuredUntil: true, featuredPlan: true },
  });

  if (!gym) throw new Error("NO_LISTING");
  return { session, gym };
}

function actionError(message: string, fieldErrors?: Record<string, string>): FeatureRequestActionResult<never> {
  return { success: false, error: message, fieldErrors };
}

function revalidateFeaturedPaths(slug: string) {
  for (const path of REVALIDATE_PATHS) revalidatePath(path);
  revalidatePath(`/gyms/${slug}`);
}

export async function submitFeatureRequest(
  input: FeatureRequestSubmitInput
): Promise<FeatureRequestActionResult<{ id: string }>> {
  try {
    const { gym } = await requireOwnerGym();
    const parsed = featureRequestSubmitSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("Please fix the errors below.", flattenFeatureRequestErrors(parsed.error));
    }

    const plan = await getFeaturedPlanById(parsed.data.planId);
    if (!plan || !plan.isActive) {
      return actionError("Selected plan is not available.");
    }

    const pending = await prisma.featureRequest.findFirst({
      where: { gymId: gym.id, status: "pending" },
      select: { id: true },
    });
    if (pending) {
      return actionError("You already have a pending promotion request. Wait for admin review.");
    }

    const created = await prisma.featureRequest.create({
      data: {
        gymId: gym.id,
        planId: plan.id,
        plan: plan.slug,
        amount: plan.amount,
        paymentMethod: parsed.data.paymentMethod,
        transactionId: parsed.data.transactionId,
        screenshotUrl: parsed.data.screenshotUrl,
        screenshotPublicId: parsed.data.screenshotPublicId,
        notes: parsed.data.notes || null,
      },
      select: { id: true },
    });

    revalidateFeaturedPaths(gym.slug);

    const { notifyAdminFeatureRequest } = await import(
      "@/services/notification/notification.dispatch"
    );
    void notifyAdminFeatureRequest({ requestId: created.id, gymName: gym.name });

    return { success: true, data: { id: created.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_LISTING") {
      return actionError("Create your listing first.");
    }
    console.error("submitFeatureRequest error:", err);
    return actionError("Failed to submit request. Please try again.");
  }
}

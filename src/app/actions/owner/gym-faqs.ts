"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-auth";
import {
  faqFormSchema,
  flattenFaqZodErrors,
  FAQ_MAX_ITEMS,
  reorderFaqsSchema,
  faqsEnabledSchema,
  type FaqFormInput,
} from "@/lib/validations/faq";

export type GymFaqActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function requireOwnerGym() {
  const session = await getOwnerSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.ownerId },
    select: { id: true, slug: true },
  });

  if (!gym) throw new Error("NO_LISTING");
  return { session, gym };
}

function actionError(message: string, fieldErrors?: Record<string, string>): GymFaqActionResult<never> {
  return { success: false, error: message, fieldErrors };
}

async function getOwnedFaq(gymId: string, faqId: string) {
  return prisma.gymFAQ.findFirst({
    where: { id: faqId, gymId },
  });
}

function revalidateFaqPaths(slug: string) {
  revalidatePath("/owner/faqs");
  revalidatePath(`/gyms/${slug}`);
}

export async function updateGymFaqsEnabled(enabled: boolean): Promise<GymFaqActionResult> {
  try {
    const { gym } = await requireOwnerGym();
    const parsed = faqsEnabledSchema.safeParse({ enabled });
    if (!parsed.success) {
      return actionError("Invalid request.");
    }

    await prisma.gym.update({
      where: { id: gym.id },
      data: { faqsEnabled: parsed.data.enabled },
    });

    revalidateFaqPaths(gym.slug);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_LISTING") {
      return actionError("Create your listing first.");
    }
    console.error("updateGymFaqsEnabled error:", err);
    return actionError("Failed to update FAQ settings.");
  }
}

export async function createGymFaq(input: FaqFormInput): Promise<GymFaqActionResult<{ id: string }>> {
  try {
    const { gym } = await requireOwnerGym();
    const parsed = faqFormSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("Please fix the errors below.", flattenFaqZodErrors(parsed.error));
    }

    const count = await prisma.gymFAQ.count({ where: { gymId: gym.id } });
    if (count >= FAQ_MAX_ITEMS) {
      return actionError(`You can add up to ${FAQ_MAX_ITEMS} FAQs.`);
    }

    const maxOrder = await prisma.gymFAQ.aggregate({
      where: { gymId: gym.id },
      _max: { displayOrder: true },
    });

    const faq = await prisma.gymFAQ.create({
      data: {
        gymId: gym.id,
        ...parsed.data,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      },
    });

    revalidateFaqPaths(gym.slug);
    return { success: true, data: { id: faq.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_LISTING") {
      return actionError("Create your listing first.");
    }
    console.error("createGymFaq error:", err);
    return actionError("Failed to create FAQ.");
  }
}

export async function updateGymFaq(
  faqId: string,
  input: FaqFormInput
): Promise<GymFaqActionResult<{ id: string }>> {
  try {
    const { gym } = await requireOwnerGym();
    const existing = await getOwnedFaq(gym.id, faqId);
    if (!existing) return actionError("FAQ not found.");

    const parsed = faqFormSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("Please fix the errors below.", flattenFaqZodErrors(parsed.error));
    }

    const faq = await prisma.gymFAQ.update({
      where: { id: faqId },
      data: parsed.data,
    });

    revalidateFaqPaths(gym.slug);
    return { success: true, data: { id: faq.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_LISTING") {
      return actionError("No listing found.");
    }
    console.error("updateGymFaq error:", err);
    return actionError("Failed to update FAQ.");
  }
}

export async function deleteGymFaq(faqId: string): Promise<GymFaqActionResult> {
  try {
    const { gym } = await requireOwnerGym();
    const existing = await getOwnedFaq(gym.id, faqId);
    if (!existing) return actionError("FAQ not found.");

    await prisma.gymFAQ.delete({ where: { id: faqId } });
    revalidateFaqPaths(gym.slug);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_LISTING") {
      return actionError("No listing found.");
    }
    console.error("deleteGymFaq error:", err);
    return actionError("Failed to delete FAQ.");
  }
}

export async function reorderGymFaqs(orderedIds: string[]): Promise<GymFaqActionResult> {
  try {
    const { gym } = await requireOwnerGym();
    const parsed = reorderFaqsSchema.safeParse({ orderedIds });
    if (!parsed.success) {
      return actionError("Invalid reorder request.", flattenFaqZodErrors(parsed.error));
    }

    const faqs = await prisma.gymFAQ.findMany({
      where: { gymId: gym.id },
      select: { id: true },
    });

    const faqIds = new Set(faqs.map((f) => f.id));
    if (
      parsed.data.orderedIds.length !== faqs.length ||
      !parsed.data.orderedIds.every((id) => faqIds.has(id))
    ) {
      return actionError("Invalid FAQ order.");
    }

    await prisma.$transaction(
      parsed.data.orderedIds.map((id, index) =>
        prisma.gymFAQ.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    );

    revalidateFaqPaths(gym.slug);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_LISTING") {
      return actionError("No listing found.");
    }
    console.error("reorderGymFaqs error:", err);
    return actionError("Failed to reorder FAQs.");
  }
}

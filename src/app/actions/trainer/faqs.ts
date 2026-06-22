"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTrainerSession } from "@/lib/trainer-auth";
import {
  faqFormSchema,
  flattenFaqZodErrors,
  FAQ_MAX_ITEMS,
  reorderFaqsSchema,
  faqsEnabledSchema,
  type FaqFormInput,
} from "@/lib/validations/faq";

export type TrainerFaqActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function requireTrainerProfile() {
  const session = await getTrainerSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const account = await prisma.trainerAccount.findUnique({
    where: { id: session.accountId },
    select: {
      trainer: { select: { id: true, slug: true } },
    },
  });

  if (!account?.trainer) throw new Error("NO_PROFILE");
  return { session, trainer: account.trainer };
}

function actionError(message: string, fieldErrors?: Record<string, string>): TrainerFaqActionResult<never> {
  return { success: false, error: message, fieldErrors };
}

async function getOwnedFaq(trainerId: string, faqId: string) {
  return prisma.trainerFAQ.findFirst({
    where: { id: faqId, trainerId },
  });
}

function revalidateFaqPaths(slug: string) {
  revalidatePath("/trainer/dashboard/faqs");
  revalidatePath(`/trainer/${slug}`);
}

export async function updateTrainerFaqsEnabled(enabled: boolean): Promise<TrainerFaqActionResult> {
  try {
    const { trainer } = await requireTrainerProfile();
    const parsed = faqsEnabledSchema.safeParse({ enabled });
    if (!parsed.success) {
      return actionError("Invalid request.");
    }

    await prisma.trainer.update({
      where: { id: trainer.id },
      data: { faqsEnabled: parsed.data.enabled },
    });

    revalidateFaqPaths(trainer.slug);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_PROFILE") {
      return actionError("Create your profile first.");
    }
    console.error("updateTrainerFaqsEnabled error:", err);
    return actionError("Failed to update FAQ settings.");
  }
}

export async function createTrainerFaq(
  input: FaqFormInput
): Promise<TrainerFaqActionResult<{ id: string }>> {
  try {
    const { trainer } = await requireTrainerProfile();
    const parsed = faqFormSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("Please fix the errors below.", flattenFaqZodErrors(parsed.error));
    }

    const count = await prisma.trainerFAQ.count({ where: { trainerId: trainer.id } });
    if (count >= FAQ_MAX_ITEMS) {
      return actionError(`You can add up to ${FAQ_MAX_ITEMS} FAQs.`);
    }

    const maxOrder = await prisma.trainerFAQ.aggregate({
      where: { trainerId: trainer.id },
      _max: { displayOrder: true },
    });

    const faq = await prisma.trainerFAQ.create({
      data: {
        trainerId: trainer.id,
        ...parsed.data,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      },
    });

    revalidateFaqPaths(trainer.slug);
    return { success: true, data: { id: faq.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_PROFILE") {
      return actionError("Create your profile first.");
    }
    console.error("createTrainerFaq error:", err);
    return actionError("Failed to create FAQ.");
  }
}

export async function updateTrainerFaq(
  faqId: string,
  input: FaqFormInput
): Promise<TrainerFaqActionResult<{ id: string }>> {
  try {
    const { trainer } = await requireTrainerProfile();
    const existing = await getOwnedFaq(trainer.id, faqId);
    if (!existing) return actionError("FAQ not found.");

    const parsed = faqFormSchema.safeParse(input);
    if (!parsed.success) {
      return actionError("Please fix the errors below.", flattenFaqZodErrors(parsed.error));
    }

    const faq = await prisma.trainerFAQ.update({
      where: { id: faqId },
      data: parsed.data,
    });

    revalidateFaqPaths(trainer.slug);
    return { success: true, data: { id: faq.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_PROFILE") {
      return actionError("No profile found.");
    }
    console.error("updateTrainerFaq error:", err);
    return actionError("Failed to update FAQ.");
  }
}

export async function deleteTrainerFaq(faqId: string): Promise<TrainerFaqActionResult> {
  try {
    const { trainer } = await requireTrainerProfile();
    const existing = await getOwnedFaq(trainer.id, faqId);
    if (!existing) return actionError("FAQ not found.");

    await prisma.trainerFAQ.delete({ where: { id: faqId } });
    revalidateFaqPaths(trainer.slug);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_PROFILE") {
      return actionError("No profile found.");
    }
    console.error("deleteTrainerFaq error:", err);
    return actionError("Failed to delete FAQ.");
  }
}

export async function reorderTrainerFaqs(orderedIds: string[]): Promise<TrainerFaqActionResult> {
  try {
    const { trainer } = await requireTrainerProfile();
    const parsed = reorderFaqsSchema.safeParse({ orderedIds });
    if (!parsed.success) {
      return actionError("Invalid reorder request.", flattenFaqZodErrors(parsed.error));
    }

    const faqs = await prisma.trainerFAQ.findMany({
      where: { trainerId: trainer.id },
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
        prisma.trainerFAQ.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    );

    revalidateFaqPaths(trainer.slug);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return actionError("You must be logged in.");
    }
    if (err instanceof Error && err.message === "NO_PROFILE") {
      return actionError("No profile found.");
    }
    console.error("reorderTrainerFaqs error:", err);
    return actionError("Failed to reorder FAQs.");
  }
}

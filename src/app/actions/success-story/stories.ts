"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-auth";
import { getTrainerSession } from "@/lib/trainer-auth";
import { getCommunitySession } from "@/lib/community-auth";
import { successStoryFormSchema } from "@/lib/validations/success-story";
import {
  generateUniqueSuccessStorySlug,
  mapStoryFormToDb,
} from "@/services/success-story/success-story.service";
import type { SuccessStoryPublisherType } from "@prisma/client";
import { getSuccessStoryPath, SUCCESS_STORIES_BASE_PATH } from "@/lib/success-stories-routes";

type PublisherContext =
  | { type: "GYM"; gymId: string }
  | { type: "TRAINER"; trainerId: string }
  | { type: "USER"; userId: string };

async function resolvePublisher(): Promise<PublisherContext | { error: string }> {
  const owner = await getOwnerSession();
  if (owner) {
    const gym = await prisma.gym.findUnique({
      where: { ownerId: owner.ownerId },
      select: { id: true },
    });
    if (gym) return { type: "GYM", gymId: gym.id };
  }

  const trainer = await getTrainerSession();
  if (trainer?.trainerId) return { type: "TRAINER", trainerId: trainer.trainerId };

  const user = await getCommunitySession();
  if (user) return { type: "USER", userId: user.userId };

  return { error: "Not signed in." };
}

function publisherFields(publisher: PublisherContext) {
  switch (publisher.type) {
    case "GYM":
      return {
        publisherType: "GYM" as SuccessStoryPublisherType,
        publisherGymId: publisher.gymId,
        publisherTrainerId: null,
        publisherUserId: null,
      };
    case "TRAINER":
      return {
        publisherType: "TRAINER" as SuccessStoryPublisherType,
        publisherGymId: null,
        publisherTrainerId: publisher.trainerId,
        publisherUserId: null,
      };
    case "USER":
      return {
        publisherType: "USER" as SuccessStoryPublisherType,
        publisherGymId: null,
        publisherTrainerId: null,
        publisherUserId: publisher.userId,
      };
  }
}

async function assertStoryOwnership(storyId: string, publisher: PublisherContext) {
  const story = await prisma.successStory.findUnique({ where: { id: storyId } });
  if (!story) return { error: "Story not found." as const };

  const owned =
    (publisher.type === "GYM" && story.publisherGymId === publisher.gymId) ||
    (publisher.type === "TRAINER" && story.publisherTrainerId === publisher.trainerId) ||
    (publisher.type === "USER" && story.publisherUserId === publisher.userId);

  if (!owned) return { error: "Unauthorized." as const };
  return { story };
}

function revalidateStoryPaths(slug?: string) {
  revalidatePath(SUCCESS_STORIES_BASE_PATH);
  if (slug) revalidatePath(getSuccessStoryPath(slug));
  revalidatePath("/gyms");
  revalidatePath("/trainers");
  revalidatePath("/trainer/dashboard/success-stories");
  revalidatePath("/owner/success-stories");
  revalidatePath("/user/dashboard/success-stories");
}

export async function saveSuccessStoryDraft(input: unknown, storyId?: string) {
  const publisher = await resolvePublisher();
  if ("error" in publisher) return { success: false as const, error: publisher.error };

  const parsed = successStoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const data = mapStoryFormToDb(parsed.data);
  const pub = publisherFields(publisher);

  if (storyId) {
    const check = await assertStoryOwnership(storyId, publisher);
    if ("error" in check) return { success: false as const, error: check.error };

    const story = await prisma.successStory.update({
      where: { id: storyId },
      data: { ...data, ...pub },
    });
    revalidateStoryPaths(story.slug);
    return { success: true as const, storyId: story.id, slug: story.slug };
  }

  const slug = await generateUniqueSuccessStorySlug(parsed.data.title);
  const story = await prisma.successStory.create({
    data: {
      ...data,
      ...pub,
      slug,
      status: "DRAFT",
    },
  });
  revalidateStoryPaths(story.slug);
  return { success: true as const, storyId: story.id, slug: story.slug };
}

export async function publishSuccessStory(input: unknown, storyId?: string) {
  const draft = await saveSuccessStoryDraft(input, storyId);
  if (!draft.success) return draft;

  const story = await prisma.successStory.update({
    where: { id: draft.storyId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
    select: {
      id: true,
      slug: true,
      title: true,
      publisherType: true,
      publisherGymId: true,
      publisherTrainerId: true,
      publisherUserId: true,
    },
  });
  revalidateStoryPaths(story.slug);

  const {
    notifySuccessStoryPublished,
    notifyAdminSuccessStorySubmission,
  } = await import("@/services/notification/notification.dispatch");

  let recipientId: string | null = null;
  let recipientRole: "OWNER" | "TRAINER" | "COMMUNITY" | null = null;

  if (story.publisherUserId) {
    recipientId = story.publisherUserId;
    recipientRole = "COMMUNITY";
  } else if (story.publisherTrainerId) {
    const trainer = await prisma.trainer.findUnique({
      where: { id: story.publisherTrainerId },
      select: { accountId: true },
    });
    if (trainer?.accountId) {
      recipientId = trainer.accountId;
      recipientRole = "TRAINER";
    }
  } else if (story.publisherGymId) {
    const gym = await prisma.gym.findUnique({
      where: { id: story.publisherGymId },
      select: { ownerId: true },
    });
    if (gym?.ownerId) {
      recipientId = gym.ownerId;
      recipientRole = "OWNER";
    }
  }

  if (recipientId && recipientRole) {
    void notifySuccessStoryPublished({
      recipientId,
      recipientRole,
      storyId: story.id,
      storySlug: story.slug,
      storyTitle: story.title,
    });
  }

  void notifyAdminSuccessStorySubmission({
    storyId: story.id,
    storyTitle: story.title,
  });

  return { success: true as const, storyId: story.id, slug: story.slug };
}

export async function deleteSuccessStory(storyId: string) {
  const publisher = await resolvePublisher();
  if ("error" in publisher) return { success: false as const, error: publisher.error };

  const check = await assertStoryOwnership(storyId, publisher);
  if ("error" in check) return { success: false as const, error: check.error };

  await prisma.successStory.delete({ where: { id: storyId } });
  revalidateStoryPaths(check.story.slug);
  return { success: true as const };
}

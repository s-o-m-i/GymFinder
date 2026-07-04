import "server-only";

import { SuccessStoryGender, type Prisma, type SuccessStoryPublisherType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { SUCCESS_STORIES_PAGE_SIZE } from "@/lib/success-stories-routes";
import type { SuccessStoryFormInput, SuccessStoryStats } from "@/lib/success-stories/types";
import { parseProgressImages, serializeProgressImages } from "@/lib/success-stories/utils";
import type { SuccessStoryListingQuery } from "@/lib/validations/success-story";

export const successStoryCardSelect = {
  id: true,
  slug: true,
  title: true,
  clientName: true,
  city: true,
  goal: true,
  duration: true,
  status: true,
  isVerified: true,
  isFeatured: true,
  publisherType: true,
  coverImageUrl: true,
  beforeImageUrl: true,
  afterImageUrl: true,
  publishedAt: true,
  createdAt: true,
  linkedGym: { select: { id: true, name: true, slug: true } },
  linkedTrainer: { select: { id: true, fullName: true, slug: true } },
} satisfies Prisma.SuccessStorySelect;

export const successStoryDetailSelect = {
  ...successStoryCardSelect,
  gender: true,
  story: true,
  progressImages: true,
  startWeight: true,
  currentWeight: true,
  height: true,
  weightUnit: true,
  heightUnit: true,
  seoTitle: true,
  seoDescription: true,
  ogImageUrl: true,
  viewCount: true,
  publisherGymId: true,
  publisherTrainerId: true,
  publisherUserId: true,
  publisherGym: { select: { id: true, name: true, slug: true } },
  publisherTrainer: { select: { id: true, fullName: true, slug: true } },
  publisherUser: { select: { id: true, fullName: true } },
  linkedGym: { select: { id: true, name: true, slug: true, area: true, city: true } },
  linkedTrainer: {
    select: {
      id: true,
      fullName: true,
      slug: true,
      profileImage: true,
      specialization: true,
    },
  },
} satisfies Prisma.SuccessStorySelect;

export type SuccessStoryCard = Prisma.SuccessStoryGetPayload<{ select: typeof successStoryCardSelect }>;
export type SuccessStoryDetail = Prisma.SuccessStoryGetPayload<{ select: typeof successStoryDetailSelect }>;

export async function generateUniqueSuccessStorySlug(title: string): Promise<string> {
  const base = slugify(title).slice(0, 80) || "success-story";
  let slug = base;
  let attempt = 0;

  while (attempt < 10) {
    const existing = await prisma.successStory.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) return slug;
    attempt += 1;
    slug = `${base}-${Date.now().toString(36).slice(-4)}${attempt}`;
  }

  return `${base}-${Date.now()}`;
}

function buildPublisherWhere(
  publisher: { type: SuccessStoryPublisherType; gymId?: string; trainerId?: string; userId?: string }
): Prisma.SuccessStoryWhereInput {
  switch (publisher.type) {
    case "GYM":
      return { publisherType: "GYM", publisherGymId: publisher.gymId };
    case "TRAINER":
      return { publisherType: "TRAINER", publisherTrainerId: publisher.trainerId };
    case "USER":
      return { publisherType: "USER", publisherUserId: publisher.userId };
    default:
      return { id: "never" };
  }
}

export async function getPublisherStoryStats(
  publisher: { type: SuccessStoryPublisherType; gymId?: string; trainerId?: string; userId?: string }
): Promise<SuccessStoryStats> {
  const where = buildPublisherWhere(publisher);
  const [total, published, draft, featured, verified] = await Promise.all([
    prisma.successStory.count({ where }),
    prisma.successStory.count({ where: { ...where, status: "PUBLISHED" } }),
    prisma.successStory.count({ where: { ...where, status: "DRAFT" } }),
    prisma.successStory.count({ where: { ...where, isFeatured: true } }),
    prisma.successStory.count({ where: { ...where, isVerified: true } }),
  ]);
  return { total, published, draft, featured, verified };
}

export async function listPublisherStories(
  publisher: { type: SuccessStoryPublisherType; gymId?: string; trainerId?: string; userId?: string },
  page = 1
) {
  const where = buildPublisherWhere(publisher);
  const skip = (page - 1) * SUCCESS_STORIES_PAGE_SIZE;
  const [items, total] = await Promise.all([
    prisma.successStory.findMany({
      where,
      select: successStoryCardSelect,
      orderBy: [{ updatedAt: "desc" }],
      skip,
      take: SUCCESS_STORIES_PAGE_SIZE,
    }),
    prisma.successStory.count({ where }),
  ]);
  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / SUCCESS_STORIES_PAGE_SIZE)),
  };
}

export function buildPublicStoriesWhere(query: SuccessStoryListingQuery): Prisma.SuccessStoryWhereInput {
  const where: Prisma.SuccessStoryWhereInput = { status: "PUBLISHED" };

  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: "insensitive" } },
      { clientName: { contains: query.q, mode: "insensitive" } },
      { city: { contains: query.q, mode: "insensitive" } },
      { linkedGym: { name: { contains: query.q, mode: "insensitive" } } },
      { linkedTrainer: { fullName: { contains: query.q, mode: "insensitive" } } },
    ];
  }
  if (query.publisherType) where.publisherType = query.publisherType;
  if (query.goal) where.goal = query.goal;
  if (query.gender) where.gender = query.gender;
  if (query.city) where.city = { equals: query.city, mode: "insensitive" };
  if (query.verified) where.isVerified = true;
  if (query.featured) where.isFeatured = true;

  return where;
}

export async function listPublicSuccessStories(query: SuccessStoryListingQuery) {
  const where = buildPublicStoriesWhere(query);
  const page = query.page ?? 1;
  const skip = (page - 1) * SUCCESS_STORIES_PAGE_SIZE;

  const [items, total] = await Promise.all([
    prisma.successStory.findMany({
      where,
      select: successStoryCardSelect,
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: SUCCESS_STORIES_PAGE_SIZE,
    }),
    prisma.successStory.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / SUCCESS_STORIES_PAGE_SIZE)),
  };
}

export async function getSuccessStoryBySlug(slug: string) {
  return prisma.successStory.findUnique({
    where: { slug },
    select: successStoryDetailSelect,
  });
}

export async function getStoriesForGymProfile(gymId: string, limit = 12) {
  return prisma.successStory.findMany({
    where: {
      status: "PUBLISHED",
      isVerified: true,
      OR: [{ linkedGymId: gymId }, { publisherGymId: gymId, publisherType: "GYM" }],
    },
    select: successStoryCardSelect,
    orderBy: [{ isFeatured: "desc" }, { isVerified: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
}

export async function getStoriesForTrainerProfile(trainerId: string, limit = 12) {
  return prisma.successStory.findMany({
    where: {
      status: "PUBLISHED",
      isVerified: true,
      OR: [
        { linkedTrainerId: trainerId },
        { publisherTrainerId: trainerId, publisherType: "TRAINER" },
      ],
    },
    select: successStoryCardSelect,
    orderBy: [{ isFeatured: "desc" }, { isVerified: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
}

export async function getStoriesForUserJourney(userId: string, limit = 24) {
  return prisma.successStory.findMany({
    where: { publisherType: "USER", publisherUserId: userId, status: "PUBLISHED" },
    select: successStoryCardSelect,
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
  });
}

export async function getRelatedSuccessStories(story: SuccessStoryDetail, limit = 3) {
  const or: Prisma.SuccessStoryWhereInput[] = [
    { goal: story.goal },
    { city: story.city },
  ];
  if (story.linkedTrainer?.id) or.push({ linkedTrainerId: story.linkedTrainer.id });
  if (story.linkedGym?.id) or.push({ linkedGymId: story.linkedGym.id });

  return prisma.successStory.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: story.id },
      OR: or,
    },
    select: successStoryCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
}

export function mapStoryFormToDb(input: SuccessStoryFormInput) {
  return {
    title: input.title.trim(),
    clientName: input.clientName.trim(),
    gender: input.gender,
    city: input.city.trim(),
    goal: input.goal,
    duration: input.duration.trim(),
    story: input.story.trim(),
    coverImageUrl: input.coverImageUrl ?? null,
    coverCloudinaryId: input.coverCloudinaryId ?? null,
    beforeImageUrl: input.beforeImageUrl,
    beforeCloudinaryId: input.beforeCloudinaryId ?? null,
    afterImageUrl: input.afterImageUrl,
    afterCloudinaryId: input.afterCloudinaryId ?? null,
    progressImages: serializeProgressImages(input.progressImages),
    startWeight: input.startWeight ?? null,
    currentWeight: input.currentWeight ?? null,
    height: input.height ?? null,
    weightUnit: input.weightUnit,
    heightUnit: input.heightUnit,
    linkedGymId: input.linkedGymId || null,
    linkedTrainerId: input.linkedTrainerId || null,
    seoTitle: input.seoTitle?.trim() || null,
    seoDescription: input.seoDescription?.trim() || null,
    ogImageUrl: input.ogImageUrl ?? null,
  };
}

export function mapStoryToFormValues(story: SuccessStoryDetail): SuccessStoryFormInput {
  return {
    title: story.title,
    clientName: story.clientName,
    gender:
      story.gender && story.gender !== "PREFER_NOT_TO_SAY" ? story.gender : SuccessStoryGender.MALE,
    city: story.city,
    goal: story.goal,
    duration: story.duration,
    story: story.story,
    coverImageUrl: story.coverImageUrl,
    coverCloudinaryId: null,
    beforeImageUrl: story.beforeImageUrl,
    beforeCloudinaryId: null,
    afterImageUrl: story.afterImageUrl,
    afterCloudinaryId: null,
    progressImages: parseProgressImages(story.progressImages),
    startWeight: story.startWeight,
    currentWeight: story.currentWeight,
    height: story.height,
    weightUnit: story.weightUnit,
    heightUnit: story.heightUnit,
    linkedGymId: story.linkedGym?.id ?? null,
    linkedTrainerId: story.linkedTrainer?.id ?? null,
    seoTitle: story.seoTitle,
    seoDescription: story.seoDescription,
    ogImageUrl: story.ogImageUrl,
  };
}

export async function searchGymsForStoryLink(q: string, limit = 8) {
  if (!q.trim()) return [];
  return prisma.gym.findMany({
    where: {
      listingStatus: "approved",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { area: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, slug: true, city: true, area: true, coverImage: true },
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function searchTrainersForStoryLink(q: string, limit = 8) {
  if (!q.trim()) return [];
  return prisma.trainer.findMany({
    where: {
      isPublished: true,
      OR: [
        { fullName: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { area: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      fullName: true,
      slug: true,
      city: true,
      area: true,
      profileImage: true,
      specialization: true,
    },
    take: limit,
    orderBy: { fullName: "asc" },
  });
}

export async function incrementSuccessStoryViews(id: string) {
  await prisma.successStory.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import type { SuccessStoryGoal, SuccessStoryPublisherType } from "@prisma/client";
import { SUCCESS_STORY_GOAL_LABELS } from "@/lib/success-stories/types";

export const SUCCESS_STORIES_BASE_PATH = "/success-stories";
export const SUCCESS_STORIES_PAGE_SIZE = 12;

export function getSuccessStoryPath(slug: string): string {
  return `${SUCCESS_STORIES_BASE_PATH}/${slug}`;
}

export function getUserJourneyPath(userId: string): string {
  return `/user/${userId}/journey`;
}

export function generateSuccessStoriesListingMetadata(): Metadata {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const title = `Success Stories`;
  const description =
    "Real fitness transformations from gyms, trainers, and community members across Pakistan — inspiring journeys on FitnessAdda.";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${base}${SUCCESS_STORIES_BASE_PATH}`,
      type: "website",
    },
    alternates: { canonical: `${base}${SUCCESS_STORIES_BASE_PATH}` },
  };
}

export function generateSuccessStoryDetailMetadata(story: {
  title: string;
  slug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  coverImageUrl?: string | null;
  afterImageUrl: string;
  clientName: string;
  city: string;
  goal: SuccessStoryGoal;
}): Metadata {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const canonical = `${base}${getSuccessStoryPath(story.slug)}`;
  const title = story.seoTitle?.trim() || story.title;
  const description =
    story.seoDescription?.trim() ||
    `${story.clientName}'s ${SUCCESS_STORY_GOAL_LABELS[story.goal].toLowerCase()} journey in ${story.city} — a real transformation on ${SITE_NAME}.`;
  const image = story.ogImageUrl || story.coverImageUrl || story.afterImageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: image ? [{ url: image, alt: story.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: { canonical },
  };
}

export function publisherTypeFilterLabel(type: SuccessStoryPublisherType): string {
  switch (type) {
    case "GYM":
      return "Gym";
    case "TRAINER":
      return "Trainer";
    case "USER":
      return "Community";
    default:
      return type;
  }
}

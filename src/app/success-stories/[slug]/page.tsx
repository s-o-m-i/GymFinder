import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { SuccessStoryDetailPage } from "@/components/success-stories/SuccessStoryDetailPage";
import { SITE_NAME } from "@/lib/constants";
import { generateSuccessStoryDetailMetadata, getSuccessStoryPath } from "@/lib/success-stories-routes";
import { SUCCESS_STORY_GOAL_LABELS } from "@/lib/success-stories/types";
import {
  getRelatedSuccessStories,
  getSuccessStoryBySlug,
  incrementSuccessStoryViews,
} from "@/services/success-story/success-story.service";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const story = await getSuccessStoryBySlug(slug);
  if (!story || story.status !== "PUBLISHED") return { title: "Story Not Found" };
  return generateSuccessStoryDetailMetadata(story);
}

export default async function SuccessStorySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const story = await getSuccessStoryBySlug(slug);
  if (!story || story.status !== "PUBLISHED") notFound();

  void incrementSuccessStoryViews(story.id);
  const related = await getRelatedSuccessStories(story);

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.seoDescription ?? `${story.clientName}'s fitness journey in ${story.city}.`,
    image: story.ogImageUrl ?? story.coverImageUrl ?? story.afterImageUrl,
    datePublished: story.publishedAt?.toISOString(),
    author: { "@type": "Organization", name: SITE_NAME },
    about: SUCCESS_STORY_GOAL_LABELS[story.goal],
    url: `${base}${getSuccessStoryPath(story.slug)}`,
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <SuccessStoryDetailPage story={story} related={related} />
    </>
  );
}

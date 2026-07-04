export const dynamic = "force-dynamic";

import { successStoryListingQuerySchema } from "@/lib/validations/success-story";
import { generateSuccessStoriesListingMetadata } from "@/lib/success-stories-routes";
import { listPublicSuccessStories } from "@/services/success-story/success-story.service";
import { SuccessStoriesListingPage } from "@/components/success-stories/SuccessStoriesListingPage";

export const metadata = generateSuccessStoriesListingMetadata();

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SuccessStoriesPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const parsed = successStoryListingQuerySchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : undefined,
    publisherType: typeof raw.publisherType === "string" ? raw.publisherType : undefined,
    goal: typeof raw.goal === "string" ? raw.goal : undefined,
    gender: typeof raw.gender === "string" ? raw.gender : undefined,
    city: typeof raw.city === "string" ? raw.city : undefined,
    verified: typeof raw.verified === "string" ? raw.verified : undefined,
    featured: typeof raw.featured === "string" ? raw.featured : undefined,
    page: typeof raw.page === "string" ? raw.page : undefined,
  });

  const query = parsed.success ? parsed.data : { page: 1 };
  const { items, total, page, totalPages } = await listPublicSuccessStories(query);

  return (
    <SuccessStoriesListingPage
      stories={items}
      total={total}
      page={page}
      totalPages={totalPages}
      searchParams={{
        q: query.q,
        publisherType: query.publisherType,
        goal: query.goal,
        gender: query.gender,
        city: query.city,
        verified: query.verified === "1" || query.verified === "true" ? "1" : undefined,
        featured: query.featured === "1" || query.featured === "true" ? "1" : undefined,
      }}
    />
  );
}

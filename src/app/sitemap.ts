import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { ALL_LISTING_SLUGS } from "@/lib/gyms-routes";
import { getGymBranchPath } from "@/lib/gym-branch-rules";
import { TRAINER_CITY_SLUG_MAP } from "@/lib/trainers-routes";
import { EVENT_CITY_SLUGS } from "@/lib/events-routes";
import { getBlogBasePath, getBlogCategoriesPath, getBlogCategoryPath, getBlogPostPath } from "@/lib/blogs-routes";
import { SUCCESS_STORIES_BASE_PATH, getSuccessStoryPath } from "@/lib/success-stories-routes";
import { getPublishedTrainerSlugs } from "@/services/trainer/trainer.service";
import { getEventSlugsForSitemap } from "@/services/events/event.service";
import { getCategories, getPosts } from "@/services/wordpress.service";
import { LEGAL_PAGES } from "@/lib/legal";

function siteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function staticEntry(
  path: string,
  opts: { changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"]; priority?: number } = {}
): MetadataRoute.Sitemap[number] {
  const base = siteBaseUrl();
  return {
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: opts.changeFrequency ?? "weekly",
    priority: opts.priority ?? 0.7,
  };
}

async function getPublishedSuccessStoryEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const stories = await prisma.successStory.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const base = siteBaseUrl();
    return stories.map((story) => ({
      url: `${base}${getSuccessStoryPath(story.slug)}`,
      lastModified: story.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));
  } catch {
    return [];
  }
}

async function getBlogEntries(): Promise<MetadataRoute.Sitemap> {
  const base = siteBaseUrl();
  const entries: MetadataRoute.Sitemap = [
    staticEntry(getBlogBasePath(), { changeFrequency: "daily", priority: 0.85 }),
    staticEntry(getBlogCategoriesPath(), { changeFrequency: "weekly", priority: 0.6 }),
  ];

  try {
    const categories = await getCategories();
    for (const category of categories) {
      entries.push({
        url: `${base}${getBlogCategoryPath(category.slug)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.65,
      });
    }

    const firstPage = await getPosts({ page: 1, perPage: 100 });
    const allPosts = [...firstPage.posts];

    for (let page = 2; page <= firstPage.totalPages; page++) {
      const batch = await getPosts({ page, perPage: 100 });
      allPosts.push(...batch.posts);
    }

    for (const post of allPosts) {
      entries.push({
        url: `${base}${getBlogPostPath(post.slug)}`,
        lastModified: new Date(post.modifiedAt),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // WordPress may be unavailable — listing pages above are still included.
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteBaseUrl();

  const [trainers, events, successStoryPages, blogPages] = await Promise.all([
    getPublishedTrainerSlugs().catch(() => []),
    getEventSlugsForSitemap().catch(() => []),
    getPublishedSuccessStoryEntries(),
    getBlogEntries(),
  ]);

  const gyms = await prisma.gym.findMany({
    where: { listingStatus: "approved" },
    select: {
      slug: true,
      updatedAt: true,
      branches: {
        where: { status: "ACTIVE" },
        select: { listingSlug: true, updatedAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const staticPages: MetadataRoute.Sitemap = [
    staticEntry("/", { changeFrequency: "daily", priority: 1 }),
    staticEntry("/gyms", { changeFrequency: "daily", priority: 0.9 }),
    staticEntry("/gyms/fighting-clubs", { changeFrequency: "daily", priority: 0.9 }),
    ...ALL_LISTING_SLUGS.map((slug) => ({
      url: `${base}/gyms/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    staticEntry("/trainers", { changeFrequency: "daily", priority: 0.9 }),
    ...Object.keys(TRAINER_CITY_SLUG_MAP).map((slug) => ({
      url: `${base}/trainers/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
    staticEntry("/events", { changeFrequency: "daily", priority: 0.9 }),
    ...EVENT_CITY_SLUGS.map((slug) => ({
      url: `${base}/events/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
    staticEntry(SUCCESS_STORIES_BASE_PATH, { changeFrequency: "daily", priority: 0.85 }),
    staticEntry("/about", { changeFrequency: "monthly", priority: 0.7 }),
    staticEntry("/contact", { changeFrequency: "monthly", priority: 0.7 }),
    staticEntry("/for-businesses", { changeFrequency: "monthly", priority: 0.75 }),
    staticEntry("/resources/faqs", { changeFrequency: "monthly", priority: 0.6 }),
    staticEntry("/ai-gym-finder", { changeFrequency: "weekly", priority: 0.75 }),
    staticEntry("/owner/register", { changeFrequency: "monthly", priority: 0.65 }),
    staticEntry("/trainer/register", { changeFrequency: "monthly", priority: 0.65 }),
    staticEntry("/legal", { changeFrequency: "monthly", priority: 0.4 }),
    ...LEGAL_PAGES.map((page) => ({
      url: `${base}${page.href}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];

  const gymPages: MetadataRoute.Sitemap = gyms.flatMap((gym) => {
    const gymEntry = {
      url: `${base}/gyms/${gym.slug}`,
      lastModified: gym.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
    const branchEntries = gym.branches
      .filter((branch) => branch.listingSlug)
      .map((branch) => ({
        url: `${base}${getGymBranchPath(branch.listingSlug!)}`,
        lastModified: branch.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    return [gymEntry, ...branchEntries];
  });

  const trainerPages: MetadataRoute.Sitemap = trainers.map((trainer) => ({
    url: `${base}/trainer/${trainer.slug}`,
    lastModified: trainer.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${base}/event/${event.slug}`,
    lastModified: event.updatedAt,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [
    ...staticPages,
    ...blogPages,
    ...successStoryPages,
    ...gymPages,
    ...trainerPages,
    ...eventPages,
  ];
}

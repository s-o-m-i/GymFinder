import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { ALL_LISTING_SLUGS } from "@/lib/gyms-routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const gyms = await prisma.gym.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url:             base,
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        1,
    },
    {
      url:             `${base}/gyms`,
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        0.9,
    },
    ...ALL_LISTING_SLUGS.map((slug) => ({
      url:             `${base}/gyms/${slug}`,
      lastModified:    new Date(),
      changeFrequency: "daily" as const,
      priority:        0.9,
    })),
  ];

  const gymPages: MetadataRoute.Sitemap = gyms.map((gym) => ({
    url:             `${base}/gyms/${gym.slug}`,
    lastModified:    gym.updatedAt,
    changeFrequency: "weekly",
    priority:        0.8,
  }));

  return [...staticPages, ...gymPages];
}

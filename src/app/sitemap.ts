import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { ALL_LISTING_SLUGS } from "@/lib/gyms-routes";
import { TRAINER_CITY_SLUG_MAP } from "@/lib/trainers-routes";
import { EVENT_CITY_SLUGS } from "@/lib/events-routes";
import { getPublishedTrainerSlugs } from "@/services/trainer/trainer.service";
import { getEventSlugsForSitemap } from "@/services/events/event.service";
import { LEGAL_PAGES } from "@/lib/legal";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const gyms = await prisma.gym.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const trainers = await getPublishedTrainerSlugs().catch(() => []);
  const events = await getEventSlugsForSitemap().catch(() => []);

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
    {
      url:             `${base}/trainers`,
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        0.9,
    },
    ...Object.keys(TRAINER_CITY_SLUG_MAP).map((slug) => ({
      url:             `${base}/trainers/${slug}`,
      lastModified:    new Date(),
      changeFrequency: "daily" as const,
      priority:        0.85,
    })),
    {
      url:             `${base}/events`,
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        0.9,
    },
    ...EVENT_CITY_SLUGS.map((slug) => ({
      url:             `${base}/events/${slug}`,
      lastModified:    new Date(),
      changeFrequency: "daily" as const,
      priority:        0.85,
    })),
    {
      url:             `${base}/trainer/login`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.5,
    },
    {
      url:             `${base}/trainer/register`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.5,
    },
    {
      url:             `${base}/legal`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.4,
    },
    ...LEGAL_PAGES.map((page) => ({
      url:             `${base}${page.href}`,
      lastModified:    new Date(),
      changeFrequency: "monthly" as const,
      priority:        0.4,
    })),
  ];

  const gymPages: MetadataRoute.Sitemap = gyms.map((gym) => ({
    url:             `${base}/gyms/${gym.slug}`,
    lastModified:    gym.updatedAt,
    changeFrequency: "weekly",
    priority:        0.8,
  }));

  const trainerPages: MetadataRoute.Sitemap = trainers.map((trainer) => ({
    url:             `${base}/trainer/${trainer.slug}`,
    lastModified:    trainer.updatedAt,
    changeFrequency: "weekly",
    priority:        0.8,
  }));

  const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
    url:             `${base}/event/${event.slug}`,
    lastModified:    event.updatedAt,
    changeFrequency: "weekly",
    priority:        0.75,
  }));

  return [...staticPages, ...gymPages, ...trainerPages, ...eventPages];
}

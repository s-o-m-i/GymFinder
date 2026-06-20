import type { Metadata } from "next";
import { CITIES, type City, SITE_NAME } from "@/lib/constants";
import { specializationLabel } from "@/lib/trainer-constants";

export const TRAINER_CITY_SLUG_MAP: Record<string, City> = {
  rawalpindi: "Rawalpindi",
  islamabad: "Islamabad",
};

export const TRAINER_CITY_SLUGS = new Set(Object.keys(TRAINER_CITY_SLUG_MAP));

export function isTrainerCitySlug(slug: string): slug is keyof typeof TRAINER_CITY_SLUG_MAP {
  return TRAINER_CITY_SLUGS.has(slug);
}

export function cityToTrainerSlug(city: City): string {
  return city.toLowerCase();
}

export function getTrainersBasePath(options?: { city?: City }): string {
  if (options?.city) {
    return `/trainers/${cityToTrainerSlug(options.city)}`;
  }
  return "/trainers";
}

export const TRAINER_CITY_SEO: Record<City, { title: string; description: string; keywords: string[] }> = {
  Rawalpindi: {
    title: "Personal Trainers & Coaches in Rawalpindi",
    description:
      "Find certified boxing, MMA, and fitness trainers in Rawalpindi. Compare experience, rates, and contact coaches directly on WhatsApp.",
    keywords: [
      "personal trainer Rawalpindi",
      "boxing coach Rawalpindi",
      "MMA trainer Rawalpindi",
      "fitness coach Rawalpindi",
    ],
  },
  Islamabad: {
    title: "Personal Trainers & Coaches in Islamabad",
    description:
      "Discover top personal trainers and fighting coaches in Islamabad. Filter by specialization and experience. Contact directly on WhatsApp.",
    keywords: [
      "personal trainer Islamabad",
      "boxing coach Islamabad",
      "MMA trainer Islamabad",
      "fitness coach Islamabad",
    ],
  },
};

export function generateTrainersListingMetadata(options?: {
  city?: City;
  specialization?: string;
}): Metadata {
  const citySeo = options?.city ? TRAINER_CITY_SEO[options.city] : null;
  const specLabel = options?.specialization
    ? specializationLabel(options.specialization)
    : null;

  const title = citySeo
    ? citySeo.title
    : specLabel
      ? `${specLabel} Trainers | ${SITE_NAME}`
      : `Find Personal Trainers & Coaches | ${SITE_NAME}`;

  const description = citySeo
    ? citySeo.description
    : specLabel
      ? `Browse ${specLabel.toLowerCase()} trainers and coaches across Pakistan. Compare profiles, certifications, and contact directly.`
      : "Browse certified personal trainers, boxing coaches, and fitness experts. Filter by city, specialization, and experience.";

  return {
    title,
    description,
    keywords: citySeo?.keywords,
    openGraph: { title, description },
  };
}

export function generateTrainerProfileMetadata(trainer: {
  fullName: string;
  slug: string;
  city: string;
  specialization: string | null;
  headline: string | null;
  bio: string | null;
  profileImage: string | null;
}): Metadata {
  const spec = trainer.specialization
    ? specializationLabel(trainer.specialization)
    : "Fitness";
  const title = `Top ${spec} Trainer in ${trainer.city} | ${SITE_NAME}`;
  const description =
    trainer.headline ??
    trainer.bio?.slice(0, 155) ??
    `Find certified ${spec.toLowerCase()} and fitness trainers in ${trainer.city}. Contact ${trainer.fullName} directly on GymxClubs.`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/trainer/${trainer.slug}`,
      images: trainer.profileImage ? [{ url: trainer.profileImage }] : undefined,
    },
    alternates: {
      canonical: `${baseUrl}/trainer/${trainer.slug}`,
    },
  };
}

export { CITIES };

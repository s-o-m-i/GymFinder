import type { Metadata } from "next";
import { CITIES, type City, SITE_NAME, cityNameToSlug } from "@/lib/constants";
import { getTrainerCitySeoCopy } from "@/lib/pakistan-cities";
import { specializationLabel } from "@/lib/trainer-constants";

export const TRAINER_CITY_SLUG_MAP: Record<string, City> = Object.fromEntries(
  CITIES.map((city) => [cityNameToSlug(city)!, city])
) as Record<string, City>;

export const TRAINER_CITY_SLUGS = new Set(Object.keys(TRAINER_CITY_SLUG_MAP));

export function isTrainerCitySlug(slug: string): slug is keyof typeof TRAINER_CITY_SLUG_MAP {
  return TRAINER_CITY_SLUGS.has(slug.toLowerCase());
}

export function cityToTrainerSlug(city: City): string {
  return cityNameToSlug(city) ?? city.toLowerCase();
}

export function getTrainersBasePath(options?: { city?: City | string }): string {
  if (options?.city) {
    const slug = cityNameToSlug(options.city);
    if (slug) return `/trainers/${slug}`;
  }
  return "/trainers";
}

export function getTrainerCitySeo(city: City) {
  return getTrainerCitySeoCopy(city);
}

export function generateTrainersListingMetadata(options?: {
  city?: City;
  specialization?: string;
}): Metadata {
  const citySeo = options?.city ? getTrainerCitySeo(options.city) : null;
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
      : "Browse certified personal trainers, boxing coaches, and fitness experts across Pakistan. Filter by city, specialization, and experience.";

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

/** @deprecated Use getTrainerCitySeo */
export const TRAINER_CITY_SEO = Object.fromEntries(
  CITIES.map((city) => [city, getTrainerCitySeoCopy(city)])
) as Record<City, ReturnType<typeof getTrainerCitySeoCopy>>;

export { CITIES };

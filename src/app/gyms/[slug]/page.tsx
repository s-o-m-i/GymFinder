import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GymProfilePage } from "@/components/gym/GymProfilePage";
import { GymsListingPage } from "@/components/gym/GymsListingPage";
import { prisma } from "@/lib/prisma";
import { gymTypeLabel, formatPrice } from "@/lib/utils";
import {
  citySlugToName,
  generateListingMetadata,
  isListingSlug,
  typeSlugToValue,
} from "@/lib/gyms-routes";
import { getGymCoverUrl } from "@/lib/images";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;

  const city = citySlugToName(slug);
  if (city) {
    return generateListingMetadata({ slug, city, searchParams: query });
  }

  const type = typeSlugToValue(slug);
  if (type) {
    return generateListingMetadata({ slug, type, searchParams: query });
  }

  const gym = await prisma.gym.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      type: true,
      customTypeLabel: true,
      area: true,
      city: true,
      priceMin: true,
      priceMax: true,
      coverImage: true,
      galleryImages: { take: 1, select: { imageUrl: true } },
    },
  });

  if (!gym) return { title: "Gym Not Found" };

  const title = `${gym.name} – ${gymTypeLabel(gym.type, gym.customTypeLabel)} in ${gym.area}, ${gym.city}`;
  const description = `${gym.description.slice(0, 160)}… Contact on WhatsApp. Membership from ${formatPrice(gym.priceMin, gym.priceMax)}.`;
  const coverImage = getGymCoverUrl(gym);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: coverImage ? [{ url: coverImage, alt: gym.name }] : [],
    },
    alternates: { canonical: `${base}/gyms/${slug}` },
  };
}

export const revalidate = 3600;

export default async function GymSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const city = citySlugToName(slug);
  if (city) {
    return <GymsListingPage searchParams={query} city={city} />;
  }

  const type = typeSlugToValue(slug);
  if (type) {
    return <GymsListingPage searchParams={query} fixedType={type} />;
  }

  if (isListingSlug(slug)) notFound();

  const exists = await prisma.gym.findUnique({
    where: { slug },
    select: { slug: true },
  });

  if (!exists) notFound();

  return <GymProfilePage slug={slug} />;
}

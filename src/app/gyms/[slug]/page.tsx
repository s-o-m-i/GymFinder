import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GymProfilePage } from "@/components/gym/GymProfilePage";
import { GymBranchProfilePage } from "@/components/gym/GymBranchProfilePage";
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
import { publicBranchDisplayName } from "@/lib/gym-branch-rules";

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

  const branch = await prisma.gymBranch.findFirst({
    where: { listingSlug: slug, status: "ACTIVE" },
    select: {
      name: true,
      area: true,
      city: true,
      address: true,
      coverImage: true,
      gym: {
        select: {
          name: true,
          description: true,
          type: true,
          customTypeLabel: true,
          coverImage: true,
          galleryImages: {
            where: { branchId: null },
            take: 1,
            select: { imageUrl: true },
          },
        },
      },
    },
  });

  if (branch) {
    const displayName = publicBranchDisplayName(branch.gym.name, branch.name);
    const title = `${displayName} – ${gymTypeLabel(branch.gym.type, branch.gym.customTypeLabel)} in ${branch.area}, ${branch.city}`;
    const description = `${displayName} at ${branch.address}, ${branch.area}, ${branch.city}. Contact on WhatsApp.`;
    const coverImage = branch.coverImage || getGymCoverUrl(branch.gym);
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: coverImage ? [{ url: coverImage, alt: displayName }] : [],
      },
      alternates: { canonical: `${base}/gyms/${slug}` },
    };
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
      galleryImages: { where: { branchId: null }, take: 1, select: { imageUrl: true } },
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

  const branch = await prisma.gymBranch.findFirst({
    where: { listingSlug: slug, status: "ACTIVE" },
    select: { listingSlug: true },
  });
  if (branch?.listingSlug) {
    return <GymBranchProfilePage listingSlug={branch.listingSlug} />;
  }

  const exists = await prisma.gym.findUnique({
    where: { slug },
    select: { slug: true },
  });

  if (!exists) notFound();

  return <GymProfilePage slug={slug} />;
}

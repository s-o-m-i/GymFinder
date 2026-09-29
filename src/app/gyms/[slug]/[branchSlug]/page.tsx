import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GymBranchProfilePage } from "@/components/gym/GymBranchProfilePage";
import { prisma } from "@/lib/prisma";
import { isListingSlug } from "@/lib/gyms-routes";
import { getGymBranchPath, isReservedBranchSlug } from "@/lib/gym-branch-rules";
import { getGymCoverUrl } from "@/lib/images";

interface PageProps {
  params: Promise<{ slug: string; branchSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, branchSlug } = await params;
  if (isListingSlug(slug) || isReservedBranchSlug(branchSlug)) {
    return { title: "Branch Not Found" };
  }

  const gym = await prisma.gym.findUnique({
    where: { slug },
    select: {
      name: true,
      coverImage: true,
      galleryImages: { where: { branchId: null }, take: 1, select: { imageUrl: true } },
      branches: {
        where: { slug: branchSlug, status: "ACTIVE" },
        select: {
          name: true,
          area: true,
          city: true,
          address: true,
          coverImage: true,
        },
        take: 1,
      },
    },
  });

  const branch = gym?.branches[0];
  if (!gym || !branch) return { title: "Branch Not Found" };

  const title = `${branch.name} – ${gym.name} in ${branch.area}, ${branch.city}`;
  const description = `${branch.name} at ${branch.address}, ${branch.area}, ${branch.city}. A ${gym.name} branch on FitnessAdda PK.`;
  const coverImage = branch.coverImage || getGymCoverUrl(gym);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: coverImage ? [{ url: coverImage, alt: branch.name }] : [],
    },
    alternates: { canonical: `${base}${getGymBranchPath(slug, branchSlug)}` },
  };
}

export const revalidate = 3600;

export default async function GymBranchSlugPage({ params }: PageProps) {
  const { slug, branchSlug } = await params;
  if (isListingSlug(slug) || isReservedBranchSlug(branchSlug)) notFound();
  return <GymBranchProfilePage gymSlug={slug} branchSlug={branchSlug} />;
}

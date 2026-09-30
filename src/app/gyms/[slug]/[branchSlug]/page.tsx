import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { GymBranchProfilePage } from "@/components/gym/GymBranchProfilePage";
import { prisma } from "@/lib/prisma";
import { isListingSlug } from "@/lib/gyms-routes";
import {
  DEFAULT_BRANCH_SLUG,
  getGymBranchPath,
  isReservedBranchSlug,
} from "@/lib/gym-branch-rules";
import { getGymCoverUrl } from "@/lib/images";

interface PageProps {
  params: Promise<{ slug: string; branchSlug: string }>;
}

async function resolvePublicBranch(slug: string, branchSlug: string) {
  const byListing = await prisma.gymBranch.findFirst({
    where: { listingSlug: slug, status: "ACTIVE" },
    select: {
      listingSlug: true,
      slug: true,
      name: true,
      area: true,
      city: true,
      address: true,
      coverImage: true,
      gym: {
        select: {
          name: true,
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

  if (byListing?.listingSlug) {
    if (
      branchSlug !== DEFAULT_BRANCH_SLUG &&
      branchSlug !== byListing.slug
    ) {
      return { redirectTo: getGymBranchPath(byListing.listingSlug) };
    }
    return { branch: byListing };
  }

  const gym = await prisma.gym.findUnique({
    where: { slug },
    select: {
      name: true,
      coverImage: true,
      galleryImages: {
        where: { branchId: null },
        take: 1,
        select: { imageUrl: true },
      },
      branches: {
        where: { slug: branchSlug, status: "ACTIVE" },
        select: {
          listingSlug: true,
          slug: true,
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

  const legacy = gym?.branches[0];
  if (gym && legacy?.listingSlug) {
    return { redirectTo: getGymBranchPath(legacy.listingSlug) };
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, branchSlug } = await params;
  if (isListingSlug(slug) || isReservedBranchSlug(branchSlug)) {
    return { title: "Branch Not Found" };
  }

  const resolved = await resolvePublicBranch(slug, branchSlug);
  if (!resolved || "redirectTo" in resolved || !resolved.branch) {
    return { title: "Branch Not Found" };
  }

  const { branch } = resolved;
  const title = `${branch.name} – ${branch.gym.name} in ${branch.area}, ${branch.city}`;
  const description = `${branch.name} at ${branch.address}, ${branch.area}, ${branch.city}. A ${branch.gym.name} branch on FitnessAdda PK.`;
  const coverImage = branch.coverImage || getGymCoverUrl(branch.gym);
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
    alternates: {
      canonical: `${base}${getGymBranchPath(branch.listingSlug!)}`,
    },
  };
}

export const revalidate = 3600;

export default async function GymBranchSlugPage({ params }: PageProps) {
  const { slug, branchSlug } = await params;
  if (isListingSlug(slug) || isReservedBranchSlug(branchSlug)) notFound();

  const resolved = await resolvePublicBranch(slug, branchSlug);
  if (!resolved) notFound();
  if ("redirectTo" in resolved && resolved.redirectTo) {
    permanentRedirect(resolved.redirectTo);
  }
  if (!resolved.branch?.listingSlug) notFound();

  return <GymBranchProfilePage listingSlug={resolved.branch.listingSlug} />;
}

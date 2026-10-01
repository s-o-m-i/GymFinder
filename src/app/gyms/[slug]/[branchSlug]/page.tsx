import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isListingSlug } from "@/lib/gyms-routes";
import {
  getGymBranchPath,
  isReservedBranchSlug,
} from "@/lib/gym-branch-rules";

interface PageProps {
  params: Promise<{ slug: string; branchSlug: string }>;
}

async function resolvePublicBranchRedirect(slug: string, branchSlug: string) {
  const byListing = await prisma.gymBranch.findFirst({
    where: { listingSlug: slug, status: "ACTIVE" },
    select: { listingSlug: true },
  });

  if (byListing?.listingSlug) {
    return getGymBranchPath(byListing.listingSlug);
  }

  const gym = await prisma.gym.findUnique({
    where: { slug },
    select: {
      branches: {
        where: { slug: branchSlug, status: "ACTIVE" },
        select: { listingSlug: true },
        take: 1,
      },
    },
  });

  const legacy = gym?.branches[0];
  if (legacy?.listingSlug) {
    return getGymBranchPath(legacy.listingSlug);
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, branchSlug } = await params;
  if (isListingSlug(slug) || isReservedBranchSlug(branchSlug)) {
    return { title: "Branch Not Found" };
  }

  const redirectTo = await resolvePublicBranchRedirect(slug, branchSlug);
  if (!redirectTo) {
    return { title: "Branch Not Found" };
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    alternates: { canonical: `${base}${redirectTo}` },
  };
}

export const revalidate = 3600;

export default async function GymBranchSlugPage({ params }: PageProps) {
  const { slug, branchSlug } = await params;
  if (isListingSlug(slug) || isReservedBranchSlug(branchSlug)) notFound();

  const redirectTo = await resolvePublicBranchRedirect(slug, branchSlug);
  if (!redirectTo) notFound();

  permanentRedirect(redirectTo);
}

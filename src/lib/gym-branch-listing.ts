import type { GymCardData } from "@/types";
import {
  inheritList,
  inheritValue,
  publicBranchDisplayName,
} from "@/lib/gym-branch-rules";
export const BRANCH_LISTING_INCLUDE = {
  galleryImages: {
    select: { imageUrl: true, alt: true },
    take: 1,
  },
  disciplines: {
    include: { discipline: { select: { name: true } } },
  },
  gym: {
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      customTypeLabel: true,
      priceMin: true,
      priceMax: true,
      ladiesStatus: true,
      sizeCategory: true,
      whatsappNumber: true,
      rating: true,
      featured: true,
      featuredUntil: true,
      openingHours: true,
      ladiesHours: true,
      coverImage: true,
      galleryImages: {
        where: { branchId: null },
        select: { imageUrl: true, alt: true },
        take: 1,
      },
      disciplines: {
        include: { discipline: { select: { name: true } } },
      },
    },
  },
} as const;

type DisciplineTag = { discipline: { name: string } };

export type BranchListingGym = {
  id: string;
  name: string;
  slug: string;
  type: GymCardData["type"];
  customTypeLabel: string | null;
  priceMin: number;
  priceMax: number;
  ladiesStatus: GymCardData["ladiesStatus"];
  sizeCategory: GymCardData["sizeCategory"];
  whatsappNumber: string;
  rating: number | null;
  featured: boolean;
  featuredUntil: Date | null;
  openingHours: string | null;
  ladiesHours: string | null;
  coverImage: string | null;
  galleryImages: { imageUrl: string; alt: string | null }[];
  disciplines: DisciplineTag[];
};

export type BranchListingRow = {
  id: string;
  name: string;
  slug: string;
  listingSlug?: string | null;
  area: string;
  city: string;
  openingHours: string | null;
  ladiesHours: string | null;
  whatsappNumber: string | null;
  priceMin: number | null;
  priceMax: number | null;
  ladiesStatus: GymCardData["ladiesStatus"] | null;
  sizeCategory: GymCardData["sizeCategory"] | null;
  coverImage: string | null;
  useCommonHours: boolean;
  useCommonDisciplines: boolean;
  galleryImages: { imageUrl: string; alt: string | null }[];
  disciplines: DisciplineTag[];
  gym: BranchListingGym;
};

export function toGymCardDataFromBranch(branch: BranchListingRow): GymCardData {
  const { gym } = branch;
  const displayName = publicBranchDisplayName(gym.name, branch.name);

  return {
    id: gym.id,
    branchId: branch.id,
    name: gym.name,
    slug: gym.slug,
    type: gym.type,
    customTypeLabel: gym.customTypeLabel,
    area: branch.area,
    city: branch.city,
    priceMin: inheritValue(false, branch.priceMin, gym.priceMin, (value) => value == null),
    priceMax: inheritValue(false, branch.priceMax, gym.priceMax, (value) => value == null),
    ladiesStatus: inheritValue(
      false,
      branch.ladiesStatus,
      gym.ladiesStatus,
      (value) => value == null
    ),
    sizeCategory: inheritValue(
      false,
      branch.sizeCategory,
      gym.sizeCategory,
      (value) => value == null
    ),
    whatsappNumber: inheritValue(
      false,
      branch.whatsappNumber,
      gym.whatsappNumber
    ),
    rating: gym.rating,
    featured: gym.featured,
    featuredUntil: gym.featuredUntil,
    openingHours: inheritValue(
      branch.useCommonHours,
      branch.openingHours,
      gym.openingHours
    ),
    coverImage: inheritValue(false, branch.coverImage, gym.coverImage),
    galleryImages: inheritList(false, branch.galleryImages, gym.galleryImages).slice(0, 1),
    disciplines: inheritList(
      branch.useCommonDisciplines,
      branch.disciplines,
      gym.disciplines
    ),
    branchName: displayName,
    branchSlug: branch.slug,
    listingSlug: branch.listingSlug ?? undefined,
  };
}

export type TrustedPartnerBusinessType =
  | "gym"
  | "trainer"
  | "fitness_studio"
  | "boxing_club"
  | "mma_academy"
  | "wellness_brand"
  | "equipment_brand"
  | "supplement_brand"
  | "apparel_brand"
  | "event_organizer"
  | "physiotherapy_clinic"
  | "nutrition_brand"
  | "sponsor";

export type TrustedPartnerTier = "verified" | "official" | "premium" | "sponsor";

export type TrustedBrandVariant =
  | "golds-gym"
  | "shapes"
  | "iron-box"
  | "ufc-gym"
  | "flex-fitness"
  | "structure"
  | "power-house"
  | "generic";

export type TrustedPartner = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  verified: boolean;
  featured: boolean;
  claimed: boolean;
  priority: number;
  website: string | null;
  gymId: string | null;
  trainerId: string | null;
  businessType: TrustedPartnerBusinessType;
  partnerTier: TrustedPartnerTier;
  rating: number | null;
  successStoryCount: number;
  trainerCount: number;
  href: string;
  brandVariant: TrustedBrandVariant;
  isPlaceholder?: boolean;
};

export type TrustedEcosystemStats = {
  gyms: number;
  trainers: number;
  cities: number;
  successStories: number;
  events: number;
};

export const TRUSTED_PARTNERS_MAX = 12;

export const TRUSTED_PARTNER_TIER_LABELS: Record<TrustedPartnerTier, string> = {
  verified: "Verified Partner",
  official: "Official Partner",
  premium: "Premium Partner",
  sponsor: "Sponsor",
};

export const SHOWCASE_TRUSTED_BRANDS: Omit<
  TrustedPartner,
  "priority" | "rating" | "successStoryCount" | "trainerCount"
>[] = [
  {
    id: "showcase-golds-gym",
    name: "Gold's Gym",
    slug: "golds-gym",
    logo: null,
    verified: true,
    featured: true,
    claimed: true,
    website: null,
    gymId: null,
    trainerId: null,
    businessType: "gym",
    partnerTier: "premium",
    href: "/gyms",
    brandVariant: "golds-gym",
    isPlaceholder: true,
  },
  {
    id: "showcase-shapes",
    name: "Shapes Health Club",
    slug: "shapes-health-club",
    logo: null,
    verified: true,
    featured: true,
    claimed: true,
    website: null,
    gymId: null,
    trainerId: null,
    businessType: "fitness_studio",
    partnerTier: "official",
    href: "/gyms",
    brandVariant: "shapes",
    isPlaceholder: true,
  },
  {
    id: "showcase-iron-box",
    name: "Iron Box Fitness",
    slug: "iron-box-fitness",
    logo: null,
    verified: true,
    featured: true,
    claimed: true,
    website: null,
    gymId: null,
    trainerId: null,
    businessType: "boxing_club",
    partnerTier: "verified",
    href: "/gyms",
    brandVariant: "iron-box",
    isPlaceholder: true,
  },
  {
    id: "showcase-ufc-gym",
    name: "UFC Gym",
    slug: "ufc-gym",
    logo: null,
    verified: true,
    featured: true,
    claimed: true,
    website: null,
    gymId: null,
    trainerId: null,
    businessType: "mma_academy",
    partnerTier: "premium",
    href: "/gyms",
    brandVariant: "ufc-gym",
    isPlaceholder: true,
  },
  {
    id: "showcase-flex-fitness",
    name: "Flex Fitness",
    slug: "flex-fitness",
    logo: null,
    verified: true,
    featured: false,
    claimed: true,
    website: null,
    gymId: null,
    trainerId: null,
    businessType: "gym",
    partnerTier: "verified",
    href: "/gyms",
    brandVariant: "flex-fitness",
    isPlaceholder: true,
  },
  {
    id: "showcase-structure",
    name: "Structure Health Club",
    slug: "structure-health-club",
    logo: null,
    verified: true,
    featured: true,
    claimed: false,
    website: null,
    gymId: null,
    trainerId: null,
    businessType: "wellness_brand",
    partnerTier: "official",
    href: "/gyms",
    brandVariant: "structure",
    isPlaceholder: true,
  },
  {
    id: "showcase-power-house",
    name: "Power House Gym",
    slug: "power-house-gym",
    logo: null,
    verified: true,
    featured: true,
    claimed: true,
    website: null,
    gymId: null,
    trainerId: null,
    businessType: "gym",
    partnerTier: "premium",
    href: "/gyms",
    brandVariant: "power-house",
    isPlaceholder: true,
  },
];

export function computeTrustedPartnerPriority(partner: Pick<
  TrustedPartner,
  "featured" | "verified" | "claimed" | "rating"
>): number {
  let score = 0;
  if (partner.featured) score += 1000;
  if (partner.verified) score += 100;
  if (partner.claimed) score += 50;
  score += Math.round((partner.rating ?? 0) * 10);
  return score;
}

export function sortTrustedPartners(partners: TrustedPartner[]): TrustedPartner[] {
  return [...partners].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    if (a.claimed !== b.claimed) return a.claimed ? -1 : 1;
    const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
    if (ratingDiff !== 0) return ratingDiff;
    return b.priority - a.priority;
  });
}

export function formatTrustedStatDisplay(value: number, floor: number): string {
  const display = Math.max(value, floor);
  return `${display.toLocaleString("en-US")}+`;
}

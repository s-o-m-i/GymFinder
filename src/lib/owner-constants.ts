import type { BusinessCategory } from "@prisma/client";
import { CUSTOM_TYPE_VALUE, GYM_TYPES } from "@/lib/constants";

export { CUSTOM_TYPE_VALUE };

export const BUSINESS_CATEGORY_LABELS: Record<BusinessCategory, string> = {
  gym:           "Gym Owner",
  fighting_club: "Fighting Club Owner",
};

export const BUSINESS_CATEGORY_SHORT: Record<BusinessCategory, string> = {
  gym:           "Gym",
  fighting_club: "Fighting Club",
};

export function businessCategoryLabel(cat: BusinessCategory): string {
  return BUSINESS_CATEGORY_LABELS[cat];
}

export function businessCategoryBadgeClass(cat: BusinessCategory): string {
  return cat === "gym"
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-orange-50 text-orange-700 border-orange-200";
}

/** Listing types shown to gym owners (no combat / fighting-club types). */
export const GYM_OWNER_TYPE_VALUES = ["gym"] as const;

/** Listing types shown to fighting-club owners (no generic "gym"). */
export const FIGHTING_CLUB_TYPE_VALUES = [
  "boxing",
  "mma",
  "muay_thai",
  "kickboxing",
  "martial_arts",
] as const;

/** Discipline names relevant to combat / fighting clubs. */
export const COMBAT_DISCIPLINE_NAMES = [
  "Boxing",
  "MMA",
  "Muay Thai",
  "Kickboxing",
  "BJJ",
  "Judo",
  "Karate",
  "Wrestling",
] as const;

export type OwnerFormCopy = {
  nameLabel: string;
  namePlaceholder: string;
  typeLabel: string;
  typeHint?: string;
  customTypeLabel: string;
  customTypePlaceholder: string;
  areaHint: string;
  descriptionPlaceholder: string;
  disciplinesTitle: string;
  coachLabel: string;
  coachPlaceholder: string;
  nameRequiredError: string;
  customTypeRequiredError: string;
};

export function resolveGymTypeForSave(
  type: string,
  customTypeLabel: string,
  businessCategory?: BusinessCategory
): { type: string; customTypeLabel: string | null } {
  if (type !== CUSTOM_TYPE_VALUE) {
    return { type, customTypeLabel: null };
  }
  const fallbackType =
    businessCategory === "fighting_club" ? "martial_arts" : "gym";
  return {
    type: fallbackType,
    customTypeLabel: customTypeLabel.trim() || null,
  };
}

export function getInitialFormType(
  category: BusinessCategory | undefined,
  savedType?: string,
  savedCustomTypeLabel?: string | null
): string {
  if (savedCustomTypeLabel?.trim()) return CUSTOM_TYPE_VALUE;
  if (savedType && category) {
    const allowed = getOwnerListingTypes(category).map((t) => t.value);
    if ((allowed as readonly string[]).includes(savedType)) return savedType;
  } else if (savedType) {
    return savedType;
  }
  return category ? getDefaultListingType(category) : "gym";
}

export function getOwnerListingTypes(category: BusinessCategory) {
  if (category === "fighting_club") {
    return GYM_TYPES.filter((t) =>
      (FIGHTING_CLUB_TYPE_VALUES as readonly string[]).includes(t.value)
    );
  }
  return GYM_TYPES.filter((t) =>
    (GYM_OWNER_TYPE_VALUES as readonly string[]).includes(t.value)
  );
}

export function getDefaultListingType(
  category: BusinessCategory,
  existing?: string
): string {
  const allowed = getOwnerListingTypes(category).map((t) => t.value);
  if (existing && (allowed as readonly string[]).includes(existing)) return existing;
  return category === "fighting_club" ? "boxing" : "gym";
}

export function isDisciplineAllowedForOwner(
  name: string,
  category: BusinessCategory
): boolean {
  if (category === "fighting_club") {
    return (COMBAT_DISCIPLINE_NAMES as readonly string[]).includes(name);
  }
  return true;
}

export function getOwnerFormCopy(category: BusinessCategory): OwnerFormCopy {
  if (category === "fighting_club") {
    return {
      nameLabel: "Club Name",
      namePlaceholder: "e.g. Rawalpindi Boxing Academy",
      typeLabel: "Primary Discipline",
      typeHint: "Pick a category or choose Other to enter your own discipline.",
      customTypeLabel: "Custom discipline",
      customTypePlaceholder: "e.g. Sambo, Krav Maga, Shaolin Kung Fu",
      areaHint: "Type any neighbourhood, or use the quick pick if yours is listed.",
      descriptionPlaceholder:
        "Describe your club, coaching style, training environment, and what fighters or members can expect…",
      disciplinesTitle: "Training Disciplines",
      coachLabel: "Head Coach & Trainers",
      coachPlaceholder:
        "List head coaches, fight experience, certifications (e.g. WBC, IFMA), and coaching background…",
      nameRequiredError: "Please enter your club name.",
      customTypeRequiredError: "Please enter your custom discipline.",
    };
  }

  return {
    nameLabel: "Gym Name",
    namePlaceholder: "e.g. Iron Will Fitness Club",
    typeLabel: "Facility Type",
    typeHint: "Pick a category or choose Other to describe your facility type.",
    customTypeLabel: "Custom facility type",
    customTypePlaceholder: "e.g. CrossFit Box, Powerlifting Studio",
    areaHint: "Type any neighbourhood, or use the quick pick if yours is listed.",
    descriptionPlaceholder:
      "Describe the gym, its facilities, atmosphere, and what makes it special…",
    disciplinesTitle: "Disciplines & Classes",
    coachLabel: "Coach Information",
    coachPlaceholder:
      "Describe the coaches, their experience, and certifications…",
    nameRequiredError: "Please enter your gym name.",
    customTypeRequiredError: "Please enter your custom facility type.",
  };
}

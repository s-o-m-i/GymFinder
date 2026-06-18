import type { BusinessCategory } from "@prisma/client";

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

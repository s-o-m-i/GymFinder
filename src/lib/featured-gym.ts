/** Shared featured-gym helpers (safe for client + server). */

export type FeaturedGymFields = {
  featured: boolean;
  featuredUntil?: Date | string | null;
};

/** True when gym should show featured badge and get featured listing priority. */
export function isGymActivelyFeatured(gym: FeaturedGymFields, now = new Date()): boolean {
  if (!gym.featured) return false;
  if (!gym.featuredUntil) return true;
  const until = gym.featuredUntil instanceof Date ? gym.featuredUntil : new Date(gym.featuredUntil);
  return until.getTime() > now.getTime();
}

export function formatFeaturedUntil(until: Date | string | null | undefined): string | null {
  if (!until) return null;
  const date = until instanceof Date ? until : new Date(until);
  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const FEATURE_REQUEST_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
} as const;

export const FEATURE_REQUEST_STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
} as const;

import { slugify } from "./utils";

export const DEFAULT_BRANCH_NAME = "Main Branch";
export const DEFAULT_BRANCH_SLUG = "main";

export function publicBranchDisplayName(gymName: string, branchName: string): string {
  const trimmed = branchName.trim();
  if (!trimmed || trimmed.toLowerCase() === DEFAULT_BRANCH_NAME.toLowerCase()) {
    return gymName;
  }
  return trimmed;
}

export function inheritValue<T>(
  useCommon: boolean,
  branchValue: T | null | undefined,
  commonValue: T,
  empty: (value: T | null | undefined) => boolean = (value) =>
    value === null || value === undefined || value === ""
): T {
  if (useCommon) return commonValue;
  if (empty(branchValue)) return commonValue;
  return branchValue as T;
}

export function inheritList<T>(
  useCommon: boolean,
  branchItems: T[] | null | undefined,
  commonItems: T[]
): T[] {
  if (useCommon) return commonItems;
  if (!branchItems?.length) return commonItems;
  return branchItems;
}

/** Nested public routes under /gyms/[slug]/ that must never be used as branch slugs. */
export const RESERVED_BRANCH_SLUGS = ["claim"] as const;

export const GYM_BRANCH_STATUSES = [
  "ACTIVE",
  "TEMPORARILY_CLOSED",
  "PERMANENTLY_CLOSED",
] as const;

export type GymBranchStatusValue = (typeof GYM_BRANCH_STATUSES)[number];

export type GymLocationCache = {
  address: string;
  area: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  whatsappNumber: string;
  openingHours: string | null;
  ladiesHours: string | null;
};

export type PrimaryBranchCreateInput = Omit<
  GymLocationCache,
  "whatsappNumber"
> & {
  name: string;
  slug: string;
  whatsappNumber: string | null;
  phone: null;
  email: null;
  status: "ACTIVE";
  isPrimary: true;
};

export function isReservedBranchSlug(slug: string): boolean {
  return (RESERVED_BRANCH_SLUGS as readonly string[]).includes(
    slug.trim().toLowerCase()
  );
}

export function normalizeBranchSlug(value: string): string {
  return slugify(value);
}

/**
 * Build a per-gym unique slug. Reserved public path segments are avoided.
 * `existingSlugs` should be other branches of the same gym (not including the
 * branch being updated, if any).
 */
export function buildUniqueBranchSlug(
  desired: string,
  existingSlugs: string[]
): string {
  const taken = new Set(
    existingSlugs.map((slug) => slug.trim().toLowerCase()).filter(Boolean)
  );

  let base = normalizeBranchSlug(desired) || DEFAULT_BRANCH_SLUG;
  if (isReservedBranchSlug(base)) {
    base = `${base}-branch`;
  }

  if (!taken.has(base)) return base;

  let n = 2;
  while (taken.has(`${base}-${n}`)) {
    n += 1;
  }
  return `${base}-${n}`;
}

export function canDeleteGymBranch(input: {
  isPrimary: boolean;
  totalBranchCount: number;
}): { ok: true } | { ok: false; reason: string } {
  if (input.totalBranchCount <= 1) {
    return {
      ok: false,
      reason: "The last branch cannot be deleted. Close it instead.",
    };
  }
  if (input.isPrimary) {
    return {
      ok: false,
      reason:
        "The primary branch cannot be deleted. Make another branch primary first.",
    };
  }
  return { ok: true };
}

export function isPubliclyVisibleBranch(status: GymBranchStatusValue): boolean {
  return status === "ACTIVE";
}

export function gymsNeedingPrimaryBranchBackfill(
  gyms: { id: string; branchCount: number }[]
): string[] {
  return gyms.filter((gym) => gym.branchCount === 0).map((gym) => gym.id);
}

export function buildMainBranchFromGym(
  gym: GymLocationCache
): PrimaryBranchCreateInput {
  return {
    name: DEFAULT_BRANCH_NAME,
    slug: DEFAULT_BRANCH_SLUG,
    address: gym.address,
    area: gym.area,
    city: gym.city,
    latitude: gym.latitude,
    longitude: gym.longitude,
    whatsappNumber: gym.whatsappNumber || null,
    openingHours: gym.openingHours,
    ladiesHours: gym.ladiesHours,
    phone: null,
    email: null,
    status: "ACTIVE",
    isPrimary: true,
  };
}

export function primaryBranchLocationFromGym(gym: GymLocationCache) {
  return {
    address: gym.address,
    area: gym.area,
    city: gym.city,
    latitude: gym.latitude,
    longitude: gym.longitude,
    whatsappNumber: gym.whatsappNumber || null,
    openingHours: gym.openingHours,
    ladiesHours: gym.ladiesHours,
  };
}

export function shouldOverwriteGymLocation(input: {
  branchIsPrimary: boolean;
  makingPrimary?: boolean;
}): boolean {
  return input.branchIsPrimary || input.makingPrimary === true;
}

export function gymLocationUpdateFromBranch(
  branch: {
    address: string;
    area: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
    whatsappNumber: string | null;
    openingHours: string | null;
    ladiesHours: string | null;
  },
  currentGymWhatsapp: string
): GymLocationCache {
  const branchWhatsapp = branch.whatsappNumber?.trim() ?? "";
  return {
    address: branch.address,
    area: branch.area,
    city: branch.city,
    latitude: branch.latitude,
    longitude: branch.longitude,
    whatsappNumber: branchWhatsapp || currentGymWhatsapp,
    openingHours: branch.openingHours,
    ladiesHours: branch.ladiesHours,
  };
}

export function canManageGymBranches(input: {
  role: "admin" | "owner";
  gymId: string;
  ownerGymId?: string | null;
}): boolean {
  if (input.role === "admin") return true;
  return Boolean(input.ownerGymId) && input.ownerGymId === input.gymId;
}

export function gymBranchStatusLabel(status: GymBranchStatusValue): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "TEMPORARILY_CLOSED":
      return "Temporarily closed";
    case "PERMANENTLY_CLOSED":
      return "Permanently closed";
  }
}

export function getGymBranchPath(gymSlug: string, branchSlug: string): string {
  return `/gyms/${gymSlug}/${branchSlug}`;
}

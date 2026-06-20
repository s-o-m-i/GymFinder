import type { MembershipDuration } from "@prisma/client";

export const FREE_MEMBERSHIP_PLAN_LIMIT = 3;

export const MEMBERSHIP_DURATION_OPTIONS: {
  value: MembershipDuration;
  label: string;
}[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly (3 months)" },
  { value: "semi_annual", label: "Semi-annual (6 months)" },
  { value: "yearly", label: "Yearly" },
];

export function membershipDurationLabel(duration: MembershipDuration): string {
  return (
    MEMBERSHIP_DURATION_OPTIONS.find((o) => o.value === duration)?.label ??
    duration
  );
}

export function formatMembershipPrice(price: number, duration: MembershipDuration): string {
  const period = membershipDurationLabel(duration).toLowerCase();
  return `PKR ${price.toLocaleString()} / ${period}`;
}

export function parseFeaturesText(features: string | null | undefined): string[] {
  if (!features?.trim()) return [];
  return features
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function canCreateMorePlans(planCount: number, isPremium: boolean): boolean {
  return isPremium || planCount < FREE_MEMBERSHIP_PLAN_LIMIT;
}

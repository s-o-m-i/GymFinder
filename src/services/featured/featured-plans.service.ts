import "server-only";

import { prisma } from "@/lib/prisma";

const DEFAULT_PLANS = [
  {
    slug: "weekly",
    name: "Featured for 7 Days",
    durationDays: 7,
    amount: 999,
    benefits: ["Appears at top of listings", "Featured badge", "Increased visibility"],
    sortOrder: 1,
  },
  {
    slug: "monthly",
    name: "Featured for 30 Days",
    durationDays: 30,
    amount: 2999,
    benefits: ["Top placement", "Featured badge", "Priority visibility"],
    sortOrder: 2,
  },
] as const;

/** Ensures default plans exist — safe to call on every page load. */
export async function ensureDefaultFeaturedPlans() {
  for (const plan of DEFAULT_PLANS) {
    await prisma.featuredPlan.upsert({
      where: { slug: plan.slug },
      create: { ...plan, benefits: [...plan.benefits], isActive: true },
      update: {},
    });
  }
}

export async function getActiveFeaturedPlans() {
  await ensureDefaultFeaturedPlans();
  return prisma.featuredPlan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { amount: "asc" }],
  });
}

export async function getAllFeaturedPlans() {
  await ensureDefaultFeaturedPlans();
  return prisma.featuredPlan.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getFeaturedPlanById(planId: string) {
  return prisma.featuredPlan.findUnique({ where: { id: planId } });
}

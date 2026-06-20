import { NextRequest, NextResponse } from "next/server";
import type { MembershipDuration } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-auth";
import {
  canCreateMorePlans,
  FREE_MEMBERSHIP_PLAN_LIMIT,
} from "@/lib/membership-plans";

const VALID_DURATIONS: MembershipDuration[] = [
  "weekly",
  "monthly",
  "quarterly",
  "semi_annual",
  "yearly",
];

async function getOwnerGym(ownerId: string) {
  return prisma.gymOwner.findUnique({
    where: { id: ownerId },
    select: {
      isPremium: true,
      gym: {
        select: {
          id: true,
          name: true,
          membershipPlans: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        },
      },
    },
  });
}

function validatePlanBody(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const price = typeof body.price === "number" ? body.price : Number(body.price);
  const duration = body.duration as MembershipDuration;
  const description =
    typeof body.description === "string" ? body.description.trim() || null : null;
  const features =
    typeof body.features === "string" ? body.features.trim() || null : null;

  if (!name) return { error: "Plan name is required." };
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "Price must be a positive number." };
  }
  if (!VALID_DURATIONS.includes(duration)) {
    return { error: "Invalid membership duration." };
  }

  return { name, price: Math.round(price), duration, description, features };
}

export async function GET() {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owner = await getOwnerGym(session.ownerId);
  if (!owner?.gym) {
    return NextResponse.json({ error: "No listing found." }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      gym: { id: owner.gym.id, name: owner.gym.name },
      plans: owner.gym.membershipPlans,
      isPremium: owner.isPremium,
      planLimit: owner.isPremium ? null : FREE_MEMBERSHIP_PLAN_LIMIT,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const owner = await getOwnerGym(session.ownerId);
    if (!owner?.gym) {
      return NextResponse.json(
        { error: "Create your listing first before adding membership plans." },
        { status: 404 }
      );
    }

    const planCount = owner.gym.membershipPlans.length;
    if (!canCreateMorePlans(planCount, owner.isPremium)) {
      return NextResponse.json(
        {
          error: `You can create up to ${FREE_MEMBERSHIP_PLAN_LIMIT} membership plans for free. Upgrade to Premium to add more.`,
          code: "PLAN_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = validatePlanBody(body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const maxSortOrder = owner.gym.membershipPlans.reduce(
      (max, plan) => Math.max(max, plan.sortOrder),
      -1
    );

    const plan = await prisma.membershipPlan.create({
      data: {
        gymId: owner.gym.id,
        ...validated,
        sortOrder: maxSortOrder + 1,
      },
    });

    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (error) {
    console.error("POST /api/owner/memberships error:", error);
    return NextResponse.json({ error: "Failed to create membership plan." }, { status: 500 });
  }
}

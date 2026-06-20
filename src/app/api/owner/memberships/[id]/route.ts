import { NextRequest, NextResponse } from "next/server";
import type { MembershipDuration } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-auth";

const VALID_DURATIONS: MembershipDuration[] = [
  "weekly",
  "monthly",
  "quarterly",
  "semi_annual",
  "yearly",
];

interface RouteContext {
  params: Promise<{ id: string }>;
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

async function getOwnedPlan(ownerId: string, planId: string) {
  return prisma.membershipPlan.findFirst({
    where: {
      id: planId,
      gym: { ownerId },
    },
  });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const existing = await getOwnedPlan(session.ownerId, id);
    if (!existing) {
      return NextResponse.json({ error: "Membership plan not found." }, { status: 404 });
    }

    const body = await req.json();
    const validated = validatePlanBody(body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const plan = await prisma.membershipPlan.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ data: plan });
  } catch (error) {
    console.error("PUT /api/owner/memberships/[id] error:", error);
    return NextResponse.json({ error: "Failed to update membership plan." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const existing = await getOwnedPlan(session.ownerId, id);
    if (!existing) {
      return NextResponse.json({ error: "Membership plan not found." }, { status: 404 });
    }

    await prisma.membershipPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/owner/memberships/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete membership plan." }, { status: 500 });
  }
}

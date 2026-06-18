import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-auth";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function GET() {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owner = await prisma.gymOwner.findUnique({
    where: { id: session.ownerId },
    select: {
      id:               true,
      name:             true,
      email:            true,
      phone:            true,
      businessCategory: true,
      createdAt:        true,
      gym: {
        select: {
          id:            true,
          name:          true,
          slug:          true,
          listingStatus: true,
          type:          true,
        },
      },
    },
  });

  if (!owner) {
    return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  }

  return NextResponse.json({ data: owner });
}

export async function PUT(req: NextRequest) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, currentPassword, newPassword } = body;

    const owner = await prisma.gymOwner.findUnique({ where: { id: session.ownerId } });
    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    const data: { name?: string; phone?: string | null; passwordHash?: string } = {};

    if (name?.trim()) data.name = name.trim();
    if (phone !== undefined) data.phone = phone?.trim() || null;

    if (newPassword) {
      if (!currentPassword || !(await verifyPassword(currentPassword, owner.passwordHash))) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
      }
      data.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.gymOwner.update({
      where: { id: session.ownerId },
      data,
      select: {
        id:               true,
        name:             true,
        email:            true,
        phone:            true,
        businessCategory: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PUT /api/owner/me error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}

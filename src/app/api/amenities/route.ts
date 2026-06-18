import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: amenities });
  } catch (error) {
    console.error("GET /api/amenities error:", error);
    return NextResponse.json({ error: "Failed to fetch amenities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSecret = req.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    const amenity = await prisma.amenity.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    return NextResponse.json({ data: amenity }, { status: 201 });
  } catch (error) {
    console.error("POST /api/amenities error:", error);
    return NextResponse.json({ error: "Failed to create amenity" }, { status: 500 });
  }
}

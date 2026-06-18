import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const disciplines = await prisma.discipline.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: disciplines });
  } catch (error) {
    console.error("GET /api/disciplines error:", error);
    return NextResponse.json({ error: "Failed to fetch disciplines" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSecret = req.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    const discipline = await prisma.discipline.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    return NextResponse.json({ data: discipline }, { status: 201 });
  } catch (error) {
    console.error("POST /api/disciplines error:", error);
    return NextResponse.json({ error: "Failed to create discipline" }, { status: 500 });
  }
}

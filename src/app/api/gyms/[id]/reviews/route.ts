import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const rating = Number(body.rating);
    const author = typeof body.author === "string" ? body.author.trim().slice(0, 80) : "";
    const text   = typeof body.text === "string"   ? body.text.trim().slice(0, 1000) : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    if (!author) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }

    const gym = await prisma.gym.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true },
    });

    if (!gym) {
      return NextResponse.json({ error: "Gym not found." }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        gymId:  gym.id,
        rating,
        author,
        text:   text || null,
      },
    });

    // Recalculate gym average rating
    const agg = await prisma.review.aggregate({
      where: { gymId: gym.id },
      _avg:  { rating: true },
    });

    await prisma.gym.update({
      where: { id: gym.id },
      data:  { rating: agg._avg.rating ?? rating },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    console.error("POST /api/gyms/[id]/reviews error:", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}

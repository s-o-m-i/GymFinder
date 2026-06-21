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
    const text = typeof body.text === "string" ? body.text.trim().slice(0, 1000) : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    if (!author) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }

    const trainer = await prisma.trainer.findFirst({
      where: { OR: [{ id }, { slug: id }], isPublished: true },
      select: { id: true },
    });

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found." }, { status: 404 });
    }

    const review = await prisma.trainerReview.create({
      data: {
        trainerId: trainer.id,
        rating,
        author,
        text: text || null,
      },
    });

    const agg = await prisma.trainerReview.aggregate({
      where: { trainerId: trainer.id },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await prisma.trainer.update({
      where: { id: trainer.id },
      data: {
        rating: agg._avg.rating ?? rating,
        totalReviews: agg._count._all,
      },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    console.error("POST /api/trainers/[id]/reviews error:", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}

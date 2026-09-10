import { NextResponse } from "next/server";
import { getSuccessStoryBySlug } from "@/services/success-story/success-story.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const story = await getSuccessStoryBySlug(slug);
    if (!story || story.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Success story not found." }, { status: 404 });
    }
    return NextResponse.json({
      data: {
        id: story.id,
        slug: story.slug,
        title: story.title,
        clientName: story.clientName,
        gender: story.gender,
        city: story.city,
        goal: story.goal,
        duration: story.duration,
        story: story.story,
        coverImageUrl: story.coverImageUrl,
        beforeImageUrl: story.beforeImageUrl,
        afterImageUrl: story.afterImageUrl,
        progressImages: story.progressImages,
        startWeight: story.startWeight,
        currentWeight: story.currentWeight,
        height: story.height,
        weightUnit: story.weightUnit,
        heightUnit: story.heightUnit,
        publisherType: story.publisherType,
        isVerified: story.isVerified,
        isFeatured: story.isFeatured,
        publishedAt: story.publishedAt,
        viewCount: story.viewCount,
        linkedGym: story.linkedGym,
        linkedTrainer: story.linkedTrainer,
      },
    });
  } catch (error) {
    console.error("GET /api/success-stories/[slug] error:", error);
    return NextResponse.json({ error: "Failed to fetch success story." }, { status: 500 });
  }
}

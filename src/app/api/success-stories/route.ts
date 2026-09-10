import { NextRequest, NextResponse } from "next/server";
import { listPublicSuccessStories } from "@/services/success-story/success-story.service";
import { successStoryListingQuerySchema } from "@/lib/validations/success-story";

export async function GET(req: NextRequest) {
  const parsed = successStoryListingQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries()),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid query." }, { status: 400 });
  }

  try {
    const result = await listPublicSuccessStories(parsed.data);
    return NextResponse.json({
      stories: result.items,
      total: result.total,
      page: result.page,
      limit: 12,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("GET /api/success-stories error:", error);
    return NextResponse.json({ error: "Failed to fetch success stories." }, { status: 500 });
  }
}

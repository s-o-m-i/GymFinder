import { NextRequest, NextResponse } from "next/server";
import { getTrainersListing } from "@/services/trainer/trainer.service";

export async function GET(req: NextRequest) {
  try {
    const result = await getTrainersListing(
      Object.fromEntries(req.nextUrl.searchParams.entries()),
    );
    return NextResponse.json({
      trainers: result.trainers,
      total: result.total,
      page: result.page,
      limit: result.filters.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("GET /api/trainers error:", error);
    return NextResponse.json({ error: "Failed to fetch trainers." }, { status: 500 });
  }
}

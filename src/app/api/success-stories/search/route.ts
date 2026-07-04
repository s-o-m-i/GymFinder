import { NextRequest, NextResponse } from "next/server";
import {
  searchGymsForStoryLink,
  searchTrainersForStoryLink,
} from "@/services/success-story/success-story.service";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const type = req.nextUrl.searchParams.get("type") ?? "gym";

  if (type === "trainer") {
    const items = await searchTrainersForStoryLink(q);
    return NextResponse.json({ items });
  }

  const items = await searchGymsForStoryLink(q);
  return NextResponse.json({ items });
}

import { NextResponse } from "next/server";
import { OWNER_COOKIE_NAME } from "@/lib/owner-auth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(OWNER_COOKIE_NAME, "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
}

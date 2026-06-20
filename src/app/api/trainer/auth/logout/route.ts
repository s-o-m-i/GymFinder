import { NextResponse } from "next/server";
import { TRAINER_COOKIE_NAME } from "@/lib/trainer-auth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(TRAINER_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}

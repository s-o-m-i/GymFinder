import { NextRequest, NextResponse } from "next/server";
import { signAdminToken, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth";
import { timingSafeEqual } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable is not set");
      return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
    }

    // Constant-time comparison to prevent timing attacks
    const inputBuf  = Buffer.from(password);
    const storedBuf = Buffer.from(adminPassword);
    const isValid =
      inputBuf.length === storedBuf.length &&
      timingSafeEqual(inputBuf, storedBuf);

    if (!isValid) {
      // Deliberate delay to slow brute-force attempts
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const token = await signAdminToken();

    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly:  true,
      secure:    process.env.NODE_ENV === "production",
      sameSite:  "lax",
      maxAge:    COOKIE_MAX_AGE,
      path:      "/",
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

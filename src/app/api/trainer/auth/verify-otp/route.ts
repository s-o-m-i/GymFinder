import { NextResponse } from "next/server";

/** @deprecated Use /trainer/login with email + password */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Passwordless login is no longer available. Create an account or sign in with your password.",
    },
    { status: 410 }
  );
}

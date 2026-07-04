import { NextResponse } from "next/server";
import { getCommunitySession } from "@/lib/community-auth";
import { getOwnerSession } from "@/lib/owner-auth";
import { getTrainerSession } from "@/lib/trainer-auth";

export async function GET() {
  const owner = await getOwnerSession();
  if (owner) {
    return NextResponse.json({
      authenticated: true,
      role: "owner",
      label: "Dashboard",
      redirect: "/owner/dashboard",
    });
  }

  const trainer = await getTrainerSession();
  if (trainer) {
    return NextResponse.json({
      authenticated: true,
      role: "trainer",
      label: "Dashboard",
      redirect: trainer.trainerId ? "/trainer/dashboard" : "/trainer/dashboard/profile",
    });
  }

  const community = await getCommunitySession();
  if (community) {
    return NextResponse.json({
      authenticated: true,
      role: "user",
      label: "Dashboard",
      redirect: "/user/dashboard/success-stories",
    });
  }

  return NextResponse.json({ authenticated: false });
}

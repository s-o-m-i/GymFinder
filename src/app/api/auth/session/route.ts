import { NextResponse } from "next/server";
import { getCommunitySession } from "@/lib/community-auth";
import { getOwnerSession } from "@/lib/owner-auth";
import { getTrainerSession } from "@/lib/trainer-auth";
import { getAdminSession } from "@/lib/auth";
import { NOTIFICATIONS_PAGE_PATH } from "@/lib/notifications/constants";

export async function GET() {
  const owner = await getOwnerSession();
  if (owner) {
    return NextResponse.json({
      authenticated: true,
      role: "owner",
      label: "Dashboard",
      redirect: "/owner/dashboard",
      notificationsPath: NOTIFICATIONS_PAGE_PATH,
      recipientId: owner.ownerId,
      recipientRole: "OWNER",
    });
  }

  const trainer = await getTrainerSession();
  if (trainer) {
    return NextResponse.json({
      authenticated: true,
      role: "trainer",
      label: "Dashboard",
      redirect: trainer.trainerId ? "/trainer/dashboard" : "/trainer/dashboard/profile",
      notificationsPath: NOTIFICATIONS_PAGE_PATH,
      recipientId: trainer.accountId,
      recipientRole: "TRAINER",
    });
  }

  const community = await getCommunitySession();
  if (community) {
    return NextResponse.json({
      authenticated: true,
      role: "user",
      label: "Dashboard",
      redirect: "/user/dashboard/success-stories",
      notificationsPath: NOTIFICATIONS_PAGE_PATH,
      recipientId: community.userId,
      recipientRole: "COMMUNITY",
    });
  }

  const isAdmin = await getAdminSession();
  if (isAdmin) {
    return NextResponse.json({
      authenticated: true,
      role: "admin",
      label: "Admin",
      redirect: "/admin",
      notificationsPath: NOTIFICATIONS_PAGE_PATH,
      recipientId: "platform-admin",
      recipientRole: "ADMIN",
    });
  }

  return NextResponse.json({ authenticated: false });
}

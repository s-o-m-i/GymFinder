export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OwnerVerifyEmailPanel } from "@/components/owner/OwnerVerifyEmailPanel";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Verify Email | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function OwnerVerifyEmailPage() {
  const session = await getOwnerSession();
  if (session) {
    const owner = await prisma.gymOwner.findUnique({
      where: { id: session.ownerId },
      select: { emailVerified: true },
    });
    if (owner?.emailVerified) {
      redirect("/owner/dashboard");
    }
  }

  return (
    <AuthPageLayout>
      <OwnerVerifyEmailPanel />
    </AuthPageLayout>
  );
}

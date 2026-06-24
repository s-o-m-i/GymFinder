export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TrainerVerifyEmailPanel } from "@/components/trainers/TrainerVerifyEmailPanel";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { getTrainerSession } from "@/lib/trainer-auth";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Verify Email | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function TrainerVerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string }>;
}) {
  const { pending } = await searchParams;
  const isSignupFlow = pending === "1";

  const session = await getTrainerSession();
  if (session) {
    const account = await prisma.trainerAccount.findUnique({
      where: { id: session.accountId },
      select: { emailVerified: true },
    });
    if (account?.emailVerified && !isSignupFlow) {
      redirect("/trainer/dashboard");
    }
  }

  return (
    <AuthPageLayout>
      <TrainerVerifyEmailPanel />
    </AuthPageLayout>
  );
}

export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTrainerSession } from "@/lib/trainer-auth";
import { prisma } from "@/lib/prisma";
import { TrainerPanelShell } from "@/components/trainers/TrainerPanelShell";
import { specializationLabel } from "@/lib/trainer-constants";

export const metadata: Metadata = {
  title: "Trainer Portal | FitnessAdda PK",
  robots: { index: false, follow: false },
};

export default async function TrainerPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getTrainerSession();
  if (!session) redirect("/trainer/login?from=/trainer/dashboard");

  const account = await prisma.trainerAccount.findUnique({
    where: { id: session.accountId },
    include: {
      trainer: {
        select: {
          fullName: true,
          specialization: true,
          slug: true,
          isPublished: true,
        },
      },
    },
  });

  if (!account) redirect("/trainer/login");

  if (!account.emailVerified) {
    redirect(
      `/trainer/verify-email?email=${encodeURIComponent(account.email)}&pending=1`
    );
  }

  const trainer = account.trainer;
  const roleLabel = trainer
    ? specializationLabel(trainer.specialization)
    : account.name ?? "Trainer Account";

  return (
    <TrainerPanelShell
      roleLabel={roleLabel}
      publicProfileSlug={trainer?.isPublished ? trainer.slug : null}
    >
      {children}
    </TrainerPanelShell>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OwnerPanelShell } from "@/components/owner/OwnerPanelShell";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Owner Portal | FitnessAdda PK",
  robots: { index: false, follow: false },
};

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await getOwnerSession();

  if (session) {
    const owner = await prisma.gymOwner.findUnique({
      where: { id: session.ownerId },
      select: { emailVerified: true, email: true },
    });

    if (owner && !owner.emailVerified) {
      redirect(
        `/owner/verify-email?email=${encodeURIComponent(owner.email)}&pending=1`
      );
    }
  }

  return <OwnerPanelShell session={session}>{children}</OwnerPanelShell>;
}

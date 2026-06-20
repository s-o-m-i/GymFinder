export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { OwnerVerifyEmailPanel } from "@/components/owner/OwnerVerifyEmailPanel";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Verify Email | GymFinder PK",
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
    <div className="min-h-screen bg-gradient-to-br from-[#0B2545] via-[#0f3060] to-[#1a4080] flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8 text-white">
        <div className="w-9 h-9 bg-[#FF6A3D] rounded-lg flex items-center justify-center">
          <Dumbbell className="w-5 h-5" />
        </div>
        <span className="font-heading font-bold">GymFinder PK</span>
      </Link>
      <OwnerVerifyEmailPanel />
    </div>
  );
}

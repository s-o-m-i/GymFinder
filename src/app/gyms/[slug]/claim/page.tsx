import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ClaimGymForm } from "@/components/gym-claim/ClaimGymForm";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-auth";
import { SITE_NAME } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const gym = await prisma.gym.findUnique({
    where: { slug },
    select: { name: true },
  });
  return {
    title: gym ? `Claim ${gym.name}` : "Claim Gym Profile",
    robots: { index: false, follow: false },
  };
}

export default async function ClaimGymPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getOwnerSession();

  if (!session) {
    redirect(`/owner/login?from=${encodeURIComponent(`/gyms/${slug}/claim`)}`);
  }

  const gym = await prisma.gym.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      claimed: true,
      ownerId: true,
      listingStatus: true,
    },
  });

  if (!gym || gym.listingStatus !== "approved") notFound();

  if (gym.claimed || gym.ownerId) {
    redirect(`/gyms/${slug}`);
  }

  const owner = await prisma.gymOwner.findUnique({
    where: { id: session.ownerId },
    select: { name: true, email: true, phone: true },
  });

  const existingGym = await prisma.gym.findUnique({
    where: { ownerId: session.ownerId },
    select: { id: true },
  });
  if (existingGym && existingGym.id !== gym.id) {
    redirect("/owner/dashboard");
  }

  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)] py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <nav className="mb-6 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--text)]">{SITE_NAME}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/gyms/${slug}`} className="hover:text-[var(--text)]">{gym.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[var(--text)]">Claim Profile</span>
          </nav>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
            <h1 className="font-heading text-2xl font-bold text-[var(--text)]">Claim Gym Profile</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{gym.name} · {gym.city}</p>
            <div className="mt-8">
              <ClaimGymForm
                gymId={gym.id}
                gymName={gym.name}
                defaultFullName={owner?.name ?? ""}
                defaultEmail={owner?.email ?? session.email}
                defaultPhone={owner?.phone ?? ""}
                defaultWhatsapp={owner?.phone ?? ""}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

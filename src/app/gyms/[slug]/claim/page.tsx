import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ClaimGymForm } from "@/components/gym-claim/ClaimGymForm";
import { prisma } from "@/lib/prisma";
import { getOwnerSession } from "@/lib/owner-auth";

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
          <Breadcrumbs
            className="mb-6"
            items={[
              { label: "Home", href: "/" },
              { label: gym.name, href: `/gyms/${slug}` },
              { label: "Claim Profile" },
            ]}
          />

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

export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, PlusCircle } from "lucide-react";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { OwnerGymBranchesPanel } from "@/components/gym-branch/OwnerGymBranchesPanel";

export default async function OwnerBranchesPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.ownerId },
    select: {
      id: true,
      name: true,
      slug: true,
      branches: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
    },
  });

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-6 h-6 text-[#FF6A3D]" />
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">
            Locations
          </h1>
        </div>
        <p className="text-[var(--text-muted)] text-sm">
          Manage physical branches for your gym listing.
        </p>
      </div>

      {!gym ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center">
          <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-2">
            Add your listing first
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            You need a gym listing before you can add branches.
          </p>
          <Link
            href="/owner/gym"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create Listing
          </Link>
        </div>
      ) : (
        <OwnerGymBranchesPanel
          gymName={gym.name}
          gymSlug={gym.slug}
          branches={gym.branches}
        />
      )}
    </div>
  );
}

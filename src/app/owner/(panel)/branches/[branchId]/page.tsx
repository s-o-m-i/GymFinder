export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { OwnerGymBranchForm } from "@/components/gym-branch/OwnerGymBranchForm";
import {
  getBranchFormInitialData,
  getGymTagCatalog,
} from "@/lib/gym-branch-form-data";

interface PageProps {
  params: Promise<{ branchId: string }>;
}

export default async function OwnerEditBranchPage({ params }: PageProps) {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const { branchId } = await params;
  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.ownerId },
    select: { id: true, name: true },
  });
  if (!gym) redirect("/owner/gym");

  const catalog = await getGymTagCatalog();
  const initialData = await getBranchFormInitialData(gym.id, branchId, catalog);
  if (!initialData) notFound();

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <Link
          href="/owner/branches"
          className="text-sm text-[var(--text-muted)] hover:text-[#FF6A3D]"
        >
          ← Back to branches
        </Link>
        <h1 className="font-heading font-bold text-2xl text-[var(--text)] mt-3">
          Edit Branch
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">{initialData.name}</p>
      </div>
      <OwnerGymBranchForm
        gymName={gym.name}
        mode="edit"
        branchId={branchId}
        initialData={initialData}
        disciplines={catalog.disciplines}
        amenities={catalog.amenities}
      />
    </div>
  );
}

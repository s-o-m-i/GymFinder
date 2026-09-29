export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminGymBranchForm } from "@/components/gym-branch/AdminGymBranchForm";
import {
  getBranchFormInitialData,
  getGymTagCatalog,
} from "@/lib/gym-branch-form-data";

interface PageProps {
  params: Promise<{ id: string; branchId: string }>;
}

export default async function EditGymBranchPage({ params }: PageProps) {
  const { id, branchId } = await params;
  const gym = await prisma.gym.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!gym) notFound();

  const catalog = await getGymTagCatalog();
  const initialData = await getBranchFormInitialData(gym.id, branchId, catalog);
  if (!initialData) notFound();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/admin/edit-gym/${gym.id}`}
          className="text-sm text-[var(--text-muted)] hover:text-[#FF6A3D]"
        >
          ← Back to {gym.name}
        </Link>
        <h1 className="font-heading font-bold text-2xl text-[var(--text)] mt-3">
          Edit Branch
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">{initialData.name}</p>
      </div>

      <AdminGymBranchForm
        gymId={gym.id}
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

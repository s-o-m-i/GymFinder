export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminGymBranchForm } from "@/components/gym-branch/AdminGymBranchForm";
import { getGymTagCatalog } from "@/lib/gym-branch-form-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AddGymBranchPage({ params }: PageProps) {
  const { id } = await params;
  const gym = await prisma.gym.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!gym) notFound();

  const { disciplines, amenities } = await getGymTagCatalog();

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
          Add Branch
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Add another branch for {gym.name}. Each branch has its own photos,
          address, and listing details.
        </p>
      </div>

      <AdminGymBranchForm
        gymId={gym.id}
        gymName={gym.name}
        mode="create"
        disciplines={disciplines}
        amenities={amenities}
      />
    </div>
  );
}

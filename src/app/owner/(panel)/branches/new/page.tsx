export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { OwnerGymBranchForm } from "@/components/gym-branch/OwnerGymBranchForm";

export default async function OwnerNewBranchPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.ownerId },
    select: { name: true },
  });
  if (!gym) redirect("/owner/gym");

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <Link
          href="/owner/branches"
          className="text-sm text-[var(--text-muted)] hover:text-[#FF6A3D]"
        >
          ← Back to locations
        </Link>
        <h1 className="font-heading font-bold text-2xl text-[var(--text)] mt-3">
          Add Branch
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Add a physical location for {gym.name}.
        </p>
      </div>
      <OwnerGymBranchForm gymName={gym.name} mode="create" />
    </div>
  );
}

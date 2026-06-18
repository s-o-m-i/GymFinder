export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { OwnerProfileForm } from "@/components/owner/OwnerProfileForm";

export default async function OwnerProfilePage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const owner = await prisma.gymOwner.findUnique({ where: { id: session.ownerId } });
  if (!owner) redirect("/owner/login");

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">My Profile</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Manage your account details</p>
      </div>
      <OwnerProfileForm
        initial={{
          name:             owner.name,
          email:            owner.email,
          phone:            owner.phone ?? "",
          businessCategory: owner.businessCategory,
        }}
      />
    </div>
  );
}

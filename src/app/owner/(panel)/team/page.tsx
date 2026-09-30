export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle, Users } from "lucide-react";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { businessCategoryLabel } from "@/lib/owner-constants";
import { StaffMembersManager } from "@/components/owner/staff/StaffMembersManager";

async function getOwnerTeamData(ownerId: string) {
  return prisma.gymOwner.findUnique({
    where: { id: ownerId },
    select: {
      businessCategory: true,
      gym: {
        select: {
          id: true,
          name: true,
          staffMembers: {
            orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });
}

export default async function OwnerTeamPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const owner = await getOwnerTeamData(session.ownerId);
  if (!owner) redirect("/owner/login");

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 shrink-0 text-[#FF6A3D]" />
          <h1 className="font-heading text-xl font-bold text-[var(--text)] sm:text-2xl">
            Team & Coaches
          </h1>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          {businessCategoryLabel(owner.businessCategory)} · Manage coaches and staff shown on your public listing.
        </p>
      </div>

      {!owner.gym ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-[#FF6A3D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="w-7 h-7 text-[#FF6A3D]" />
          </div>
          <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-2">
            Add your listing first
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
            You need a gym or fighting club listing before you can add team members.
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
        <StaffMembersManager
          gymName={owner.gym.name}
          initialMembers={owner.gym.staffMembers}
        />
      )}
    </div>
  );
}

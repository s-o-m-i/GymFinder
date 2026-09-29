export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, PlusCircle } from "lucide-react";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { businessCategoryLabel } from "@/lib/owner-constants";
import { OwnerMembershipPlansManager } from "@/components/owner/OwnerMembershipPlansManager";
import { FREE_MEMBERSHIP_PLAN_LIMIT } from "@/lib/membership-plans";

async function getOwnerMembershipData(ownerId: string) {
  return prisma.gymOwner.findUnique({
    where: { id: ownerId },
    select: {
      businessCategory: true,
      isPremium: true,
      gym: {
        select: {
          id: true,
          name: true,
          membershipPlans: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        },
      },
    },
  });
}

export default async function OwnerMembershipsPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const owner = await getOwnerMembershipData(session.ownerId);
  if (!owner) redirect("/owner/login");

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-6 h-6 text-[#FF6A3D]" />
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">
            Membership Plans
          </h1>
        </div>
        <p className="text-[var(--text-muted)] text-sm">
          {businessCategoryLabel(owner.businessCategory)} · Create up to{" "}
          {FREE_MEMBERSHIP_PLAN_LIMIT} plans for free. These plans are shared
          across every branch unless you later customize a branch.
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
            You need a gym or fighting club listing before you can create membership plans.
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
        <OwnerMembershipPlansManager
          gymName={owner.gym.name}
          initialPlans={owner.gym.membershipPlans}
          isPremium={owner.isPremium}
        />
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { OwnerProfileTabs } from "@/components/owner/OwnerProfileTabs";
import {
  businessCategoryBadgeClass,
  businessCategoryLabel,
} from "@/lib/owner-constants";
import { Building2, Swords } from "lucide-react";

export default async function OwnerProfilePage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const owner = await prisma.gymOwner.findUnique({
    where: { id: session.ownerId },
    include: {
      gym: {
        select: {
          name: true,
          slug: true,
          listingStatus: true,
        },
      },
    },
  });
  if (!owner) redirect("/owner/login");

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">
            My Profile
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Manage your account, password, and shareable listing link
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-xs font-semibold border ${businessCategoryBadgeClass(owner.businessCategory)}`}
        >
          {owner.businessCategory === "fighting_club" ? (
            <Swords className="w-3.5 h-3.5" />
          ) : (
            <Building2 className="w-3.5 h-3.5" />
          )}
          {businessCategoryLabel(owner.businessCategory)}
        </span>
      </div>

      <OwnerProfileTabs
        initial={{
          name: owner.name,
          email: owner.email,
          phone: owner.phone ?? "",
          businessCategory: owner.businessCategory,
        }}
        gym={owner.gym}
      />
    </div>
  );
}

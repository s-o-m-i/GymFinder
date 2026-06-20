export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { businessCategoryLabel, businessCategoryBadgeClass } from "@/lib/owner-constants";
import { gymTypeLabel } from "@/lib/utils";
import { PlusCircle, Edit, Clock, CheckCircle2, XCircle, ExternalLink, CreditCard } from "lucide-react";
import { ShareListingUrl } from "@/components/owner/ShareListingUrl";

async function getOwnerData(ownerId: string) {
  return prisma.gymOwner.findUnique({
    where: { id: ownerId },
    include: {
      gym: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          customTypeLabel: true,
          area: true,
          city: true,
          listingStatus: true,
          coverImage: true,
        },
      },
    },
  });
}

const STATUS_STYLES = {
  pending:  { label: "Pending Review", icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Live on Site", icon: CheckCircle2, className: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-red-50 text-red-700 border-red-200" },
};

export default async function OwnerDashboardPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const owner = await getOwnerData(session.ownerId);
  if (!owner) redirect("/owner/login");

  const statusInfo = owner.gym ? STATUS_STYLES[owner.gym.listingStatus] : null;

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">
          Welcome, {owner.name}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {businessCategoryLabel(owner.businessCategory)} · {owner.email}
        </p>
      </div>

      {/* Account type badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-6 ${businessCategoryBadgeClass(owner.businessCategory)}`}>
        {owner.businessCategory === "fighting_club" ? "🥊" : "🏋️"}
        {businessCategoryLabel(owner.businessCategory)}
      </div>

      {!owner.gym ? (
        <Link
          href="/owner/gym"
          className="group block bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center transition-all hover:border-[#FF6A3D]/40 hover:shadow-md hover:shadow-[#FF6A3D]/10 cursor-pointer"
        >
          <div className="w-16 h-16 bg-[#FF6A3D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors group-hover:bg-[#FF6A3D]/15">
            <PlusCircle className="w-8 h-8 text-[#FF6A3D]" />
          </div>
          <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-2">
            Add Your {owner.businessCategory === "fighting_club" ? "Fighting Club" : "Gym"}
          </h2>
          <p className="text-[var(--text-muted)] text-sm mb-6 max-w-sm mx-auto">
            You haven&apos;t added a listing yet. Each account can manage one gym or fighting club.
          </p>
          <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl group-hover:bg-[#e85528] transition-colors">
            <PlusCircle className="w-4 h-4" />
            Create Listing
          </span>
        </Link>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-[var(--text)]">{owner.gym.name}</h2>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {gymTypeLabel(owner.gym.type, owner.gym.customTypeLabel)} · {owner.gym.area}, {owner.gym.city}
              </p>
            </div>
            {statusInfo && (() => {
              const StatusIcon = statusInfo.icon;
              return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.className}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </span>
              );
            })()}
          </div>

          {owner.gym.listingStatus === "pending" && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              Your listing is under review. It will appear on the public site once approved by our team.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/owner/gym"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B2545] text-white text-sm font-semibold rounded-xl hover:bg-[#071832] transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Listing
            </Link>
            <Link
              href="/owner/memberships"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] text-sm font-semibold text-[var(--text)] rounded-xl hover:border-[#FF6A3D]/30 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Membership Plans
            </Link>
            {owner.gym.listingStatus === "approved" && (
              <Link
                href={`/gyms/${owner.gym.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] text-sm font-semibold text-[var(--text)] rounded-xl hover:border-[#FF6A3D]/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Public Page
              </Link>
            )}
          </div>

          <div className="mt-5">
            <ShareListingUrl
              slug={owner.gym.slug}
              listingName={owner.gym.name}
              listingStatus={owner.gym.listingStatus}
            />
          </div>
        </div>
      )}
    </div>
  );
}

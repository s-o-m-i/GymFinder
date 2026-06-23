export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle, Sparkles } from "lucide-react";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { FeaturedPromotionForm } from "@/components/owner/featured/FeaturedPromotionForm";
import { FeaturedRequestHistory } from "@/components/owner/featured/FeaturedRequestHistory";
import { getActiveFeaturedPlans } from "@/services/featured/featured-plans.service";
import { getFeaturedPaymentConfig } from "@/lib/featured-payment-config";
import { isGymActivelyFeatured } from "@/lib/featured-gym";

export default async function OwnerFeaturedPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const [owner, plans, paymentConfig] = await Promise.all([
    prisma.gymOwner.findUnique({
      where: { id: session.ownerId },
      select: {
        gym: {
          select: {
            id: true,
            name: true,
            slug: true,
            featured: true,
            featuredUntil: true,
            featuredPlan: true,
            featureRequests: {
              orderBy: { createdAt: "desc" },
              take: 20,
            },
          },
        },
      },
    }),
    getActiveFeaturedPlans(),
    Promise.resolve(getFeaturedPaymentConfig()),
  ]);

  if (!owner) redirect("/owner/login");

  const gym = owner.gym;
  const hasPendingRequest = gym?.featureRequests.some((r) => r.status === "pending") ?? false;

  return (
    <div className="mx-auto w-full max-w-4xl p-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[#FF6A3D]" />
          <h1 className="font-heading text-2xl font-bold text-[var(--text)]">Promote Your Gym</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Get featured placement at the top of gym listings across Pakistan.
        </p>
      </div>

      {!gym ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6A3D]/10">
            <PlusCircle className="h-7 w-7 text-[#FF6A3D]" />
          </div>
          <h2 className="font-heading mb-2 text-lg font-bold text-[var(--text)]">Add your listing first</h2>
          <p className="mx-auto mb-6 max-w-sm text-sm text-[var(--text-muted)]">
            Create your gym listing before requesting featured promotion.
          </p>
          <Link
            href="/owner/gym"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A3D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e85528]"
          >
            <PlusCircle className="h-4 w-4" />
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          <FeaturedPromotionForm
            plans={plans}
            hasPendingRequest={hasPendingRequest}
            paymentConfig={paymentConfig}
          />
          <FeaturedRequestHistory
            requests={gym.featureRequests}
            gymFeaturedUntil={gym.featuredUntil}
            gymFeaturedPlan={gym.featuredPlan}
            isActivelyFeatured={isGymActivelyFeatured(gym)}
          />
        </div>
      )}
    </div>
  );
}

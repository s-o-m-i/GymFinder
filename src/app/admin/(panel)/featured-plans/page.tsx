export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AdminFeaturedPlansManager } from "@/components/admin/AdminFeaturedPlansManager";
import { getAllFeaturedPlans } from "@/services/featured/featured-plans.service";

export default async function AdminFeaturedPlansPage() {
  const plans = await getAllFeaturedPlans();

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/featured-requests"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[#FF6A3D]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to requests
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[#FF6A3D]" />
          <h1 className="font-heading text-2xl font-bold text-[var(--text)]">Featured Plans</h1>
        </div>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Configure pricing, duration, and benefits for owner promotion plans.
        </p>
      </div>

      <AdminFeaturedPlansManager initialPlans={plans} />
    </div>
  );
}

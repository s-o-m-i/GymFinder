export const dynamic = "force-dynamic";

import { Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminGymClaimsTable } from "@/components/admin/AdminGymClaimsTable";
import { listGymClaimsForAdmin } from "@/services/gym-claim/gym-claim.service";

export default async function AdminGymClaimsPage() {
  const [claims, pendingCount] = await Promise.all([
    listGymClaimsForAdmin(),
    prisma.gymClaimRequest.count({ where: { status: "PENDING" } }),
  ]);

  const cities = [...new Set(claims.map((c) => c.gym.city))].sort();

  const rows = claims.map((claim) => ({
    id: claim.id,
    fullName: claim.fullName,
    email: claim.email,
    phone: claim.phone,
    whatsapp: claim.whatsapp,
    position: claim.position,
    status: claim.status,
    submittedAt: claim.submittedAt,
    gym: claim.gym,
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-[#FF6A3D]" />
          <h1 className="font-heading text-2xl font-bold text-[var(--text)]">Profile Claims</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Review gym ownership claims from business owners and managers.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Pending</p>
          <p className="font-heading mt-2 text-2xl font-bold text-[var(--text)]">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Total Claims</p>
          <p className="font-heading mt-2 text-2xl font-bold text-[var(--text)]">{claims.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Unclaimed Gyms</p>
          <p className="font-heading mt-2 text-2xl font-bold text-[var(--text)]">
            {await prisma.gym.count({ where: { claimed: false, ownerId: null, listingStatus: "approved" } })}
          </p>
        </div>
      </div>

      <AdminGymClaimsTable claims={rows} cities={cities} />
    </div>
  );
}

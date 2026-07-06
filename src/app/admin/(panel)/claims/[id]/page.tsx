export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { AdminGymClaimDetail } from "@/components/admin/AdminGymClaimDetail";
import { getGymClaimById } from "@/services/gym-claim/gym-claim.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminGymClaimDetailPage({ params }: PageProps) {
  const { id } = await params;
  const claim = await getGymClaimById(id);
  if (!claim) notFound();

  return (
    <div className="p-8 max-w-5xl">
      <AdminGymClaimDetail claim={claim} />
    </div>
  );
}

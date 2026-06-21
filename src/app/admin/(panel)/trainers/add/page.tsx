export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminTrainerForm } from "@/components/admin/AdminTrainerForm";
import { getApprovedGymsForTrainerForm } from "@/services/trainer/admin-trainer.service";

export default async function AdminAddTrainerPage() {
  const gyms = await getApprovedGymsForTrainerForm();

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/admin/trainers"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to trainers
      </Link>

      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Add Trainer</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Create a trainer profile manually — no trainer account required
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
        <AdminTrainerForm mode="create" gyms={gyms} />
      </div>
    </div>
  );
}

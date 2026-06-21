export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AdminTrainerForm } from "@/components/admin/AdminTrainerForm";
import {
  getAdminTrainerById,
  getApprovedGymsForTrainerForm,
} from "@/services/trainer/admin-trainer.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditTrainerPage({ params }: PageProps) {
  const { id } = await params;
  const [trainer, gyms] = await Promise.all([
    getAdminTrainerById(id),
    getApprovedGymsForTrainerForm(),
  ]);

  if (!trainer) notFound();

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/admin/trainers"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to trainers
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Edit Trainer</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">{trainer.fullName}</p>
        </div>
        {trainer.isPublished && (
          <Link
            href={`/trainer/${trainer.slug}`}
            target="_blank"
            className="text-sm font-semibold text-[#FF6A3D] hover:underline"
          >
            View public profile →
          </Link>
        )}
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
        <AdminTrainerForm trainer={trainer} gyms={gyms} mode="edit" />
      </div>
    </div>
  );
}

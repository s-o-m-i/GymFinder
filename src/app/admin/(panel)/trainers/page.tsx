export const dynamic = "force-dynamic";

import Link from "next/link";
import { UserRound, PlusCircle, Eye, EyeOff, BadgeCheck, Star } from "lucide-react";
import {
  getAdminTrainersList,
} from "@/services/trainer/admin-trainer.service";
import { AdminTrainersTable } from "@/components/admin/AdminTrainersTable";

async function getStats() {
  const trainers = await getAdminTrainersList();
  return {
    total: trainers.length,
    published: trainers.filter((t) => t.isPublished).length,
    disabled: trainers.filter((t) => !t.isPublished).length,
    verified: trainers.filter((t) => t.isVerified).length,
    featured: trainers.filter((t) => t.isFeatured).length,
  };
}

export default async function AdminTrainersPage() {
  const [trainers, stats] = await Promise.all([getAdminTrainersList(), getStats()]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Trainers</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Manage trainer profiles — publish, verify, feature, or create new listings
          </p>
        </div>
        <Link
          href="/admin/trainers/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Trainer
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase text-[var(--text-muted)] mb-1">Total</div>
          <div className="font-mono-nums font-bold text-2xl text-[var(--text)]">{stats.total}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <div className="flex items-center gap-1 text-xs font-semibold uppercase text-green-600 mb-1">
            <Eye className="w-3 h-3" /> Published
          </div>
          <div className="font-mono-nums font-bold text-2xl text-green-700">{stats.published}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <div className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 mb-1">
            <EyeOff className="w-3 h-3" /> Disabled
          </div>
          <div className="font-mono-nums font-bold text-2xl text-gray-600">{stats.disabled}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <div className="flex items-center gap-1 text-xs font-semibold uppercase text-blue-600 mb-1">
            <BadgeCheck className="w-3 h-3" /> Verified
          </div>
          <div className="font-mono-nums font-bold text-2xl text-blue-700">{stats.verified}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <div className="flex items-center gap-1 text-xs font-semibold uppercase text-amber-600 mb-1">
            <Star className="w-3 h-3" /> Featured
          </div>
          <div className="font-mono-nums font-bold text-2xl text-amber-700">{stats.featured}</div>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex items-center gap-2">
          <UserRound className="w-4 h-4 text-[var(--text-muted)]" />
          <h2 className="font-heading font-bold text-[var(--text)]">All Trainers</h2>
        </div>
        <AdminTrainersTable trainers={trainers} />
      </div>
    </div>
  );
}

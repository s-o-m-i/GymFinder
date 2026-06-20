import Link from "next/link";
import { TrainerCard } from "@/components/trainers/TrainerCard";
import type { TrainerCardData } from "@/services/trainer/trainer.service";

interface TrainersResultsSectionProps {
  trainers: TrainerCardData[];
  total: number;
  page: number;
  totalPages: number;
  basePath?: string;
  searchParams: Record<string, string | string[] | undefined>;
}

function buildPageHref(
  basePath: string,
  searchParams: Record<string, string | string[] | undefined>,
  page: number
) {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(searchParams)) {
    if (key === "page" || val == null) continue;
    if (typeof val === "string") params.set(key, val);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function TrainersResultsSection({
  trainers,
  total,
  page,
  totalPages,
  basePath = "/trainers",
  searchParams,
}: TrainersResultsSectionProps) {
  if (trainers.length === 0) {
    return (
      <div className="text-center py-16 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        <p className="font-heading font-bold text-lg text-[var(--text)] mb-2">No trainers found</p>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Try adjusting filters or browse all trainers.
        </p>
        <Link
          href="/trainers"
          className="inline-flex px-4 py-2 bg-[#0B2545] text-white text-sm font-semibold rounded-xl hover:bg-[#071832]"
        >
          View all trainers
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, total)} of {total} trainers
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {trainers.map((trainer) => (
          <TrainerCard key={trainer.id} trainer={trainer} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={buildPageHref(basePath, searchParams, page - 1)}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[#FF6A3D]/40"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-[var(--text-muted)] px-2">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildPageHref(basePath, searchParams, page + 1)}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[#FF6A3D]/40"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

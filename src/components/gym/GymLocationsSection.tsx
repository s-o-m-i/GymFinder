import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { getGymBranchPath } from "@/lib/gym-branch-rules";

export type PublicGymBranch = {
  name: string;
  slug: string;
  address: string;
  area: string;
  city: string;
  openingHours: string | null;
};

interface GymLocationsSectionProps {
  gymName: string;
  gymSlug: string;
  branches: PublicGymBranch[];
}

export function GymLocationsSection({
  gymName,
  gymSlug,
  branches,
}: GymLocationsSectionProps) {
  if (branches.length < 2) return null;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="font-heading font-bold text-lg text-[var(--text)]">
            Locations
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {gymName} · {branches.length} locations
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {branches.map((branch) => (
          <div
            key={branch.slug}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)]"
          >
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[var(--text)]">
                {branch.name}
              </h3>
              <div className="flex items-start gap-1.5 text-sm text-[var(--text-muted)] mt-1.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  {branch.address}, {branch.area}, {branch.city}
                </span>
              </div>
              {branch.openingHours && (
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] mt-1">
                  <Clock className="w-4 h-4" />
                  {branch.openingHours}
                </div>
              )}
            </div>
            <Link
              href={getGymBranchPath(gymSlug, branch.slug)}
              className="shrink-0 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-[#0B2545] rounded-xl hover:bg-[#071832] transition-colors"
            >
              View Branch
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

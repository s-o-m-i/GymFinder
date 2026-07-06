import Link from "next/link";
import { Building2, CheckCircle2 } from "lucide-react";

interface ClaimGymBannerProps {
  gymSlug: string;
  claimed: boolean;
}

export function ClaimGymBanner({ gymSlug, claimed }: ClaimGymBannerProps) {
  if (claimed) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-heading font-bold text-[var(--text)]">Claimed Business</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Managed by verified owner
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#0B2545]/15 bg-gradient-to-br from-[#0B2545]/5 to-[#FF6A3D]/5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-bold text-[var(--text)]">Own this Gym?</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Claim this profile and start managing your gym on FitnessAdda.
          </p>
          <Link
            href={`/gyms/${gymSlug}/claim`}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#0B2545] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#071832] sm:w-auto"
          >
            Claim This Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

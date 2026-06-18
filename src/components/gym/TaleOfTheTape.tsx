import { Clock, DollarSign, Users, Maximize2, Star } from "lucide-react";
import { formatPrice, ladiesStatusLabel, sizeCategoryLabel } from "@/lib/utils";

interface TaleOfTheTapeProps {
  priceMin: number;
  priceMax: number;
  openingHours?: string | null;
  disciplines: string[];
  sizeCategory: string;
  ladiesStatus: string;
  rating?: number | null;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function StatItem({ icon, label, value, highlight }: StatItemProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs font-medium uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div
        className={`font-mono-nums font-semibold text-sm ${
          highlight ? "text-[#FF6A3D]" : "text-[var(--text)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function TaleOfTheTape({
  priceMin,
  priceMax,
  openingHours,
  disciplines,
  sizeCategory,
  ladiesStatus,
  rating,
}: TaleOfTheTapeProps) {
  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 bg-[#FF6A3D] rounded-full" />
        <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-[var(--text-muted)]">
          Tale of the Tape
        </h3>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-5">
        <StatItem
          icon={<DollarSign className="w-3.5 h-3.5" />}
          label="Monthly Fee"
          value={formatPrice(priceMin, priceMax)}
          highlight
        />
        <StatItem
          icon={<Clock className="w-3.5 h-3.5" />}
          label="Hours"
          value={openingHours ?? "Contact for hours"}
        />
        <StatItem
          icon={<Maximize2 className="w-3.5 h-3.5" />}
          label="Facility Size"
          value={sizeCategoryLabel(sizeCategory)}
        />
        <StatItem
          icon={<Users className="w-3.5 h-3.5" />}
          label="Ladies"
          value={ladiesStatusLabel(ladiesStatus)}
        />
      </div>

      {/* Disciplines */}
      {disciplines.length > 0 && (
        <div className="mt-5 pt-5 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs font-medium uppercase tracking-wide mb-3">
            <Star className="w-3.5 h-3.5" />
            Disciplines
          </div>
          <div className="flex flex-wrap gap-2">
            {disciplines.map((d) => (
              <span
                key={d}
                className="px-2.5 py-1 bg-[#0B2545]/8 text-[#0B2545] dark:bg-white/10 dark:text-[#EAF0F6] text-xs font-medium rounded-lg border border-[#0B2545]/15"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rating bar */}
      {rating && (
        <div className="mt-5 pt-5 border-t border-[var(--border)] flex items-center gap-3">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-[var(--border)]"
                }`}
              />
            ))}
          </div>
          <span className="font-mono-nums text-sm font-semibold text-[var(--text)]">
            {rating.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}

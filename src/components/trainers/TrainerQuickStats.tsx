import { Clock, DollarSign, Star, Dumbbell } from "lucide-react";
import { formatHourlyRate, specializationLabel } from "@/lib/trainer-constants";

interface TrainerQuickStatsProps {
  experienceYears: number | null;
  hourlyRate: number | null;
  rating: number | null;
  totalReviews: number;
  specialization: string | null;
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px] font-semibold uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <p
        className={`font-heading font-bold text-lg leading-tight ${
          highlight ? "text-[#FF6A3D]" : "text-[var(--text)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function TrainerQuickStats({
  experienceYears,
  hourlyRate,
  rating,
  totalReviews,
  specialization,
}: TrainerQuickStatsProps) {
  const items = [
    experienceYears != null
      ? {
          icon: <Clock className="w-3.5 h-3.5" />,
          label: "Experience",
          value: `${experienceYears}+ years`,
        }
      : null,
    hourlyRate != null
      ? {
          icon: <DollarSign className="w-3.5 h-3.5" />,
          label: "Hourly Rate",
          value: formatHourlyRate(hourlyRate),
          highlight: true,
        }
      : null,
    rating != null
      ? {
          icon: <Star className="w-3.5 h-3.5" />,
          label: "Rating",
          value: `${rating.toFixed(1)} ★${totalReviews > 0 ? ` (${totalReviews})` : ""}`,
        }
      : null,
    specialization
      ? {
          icon: <Dumbbell className="w-3.5 h-3.5" />,
          label: "Specialization",
          value: specializationLabel(specialization),
        }
      : null,
  ].filter(Boolean) as {
    icon: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
  }[];

  if (items.length === 0) return null;

  return (
    <div
      className={`grid gap-4 ${
        items.length === 1
          ? "grid-cols-1"
          : items.length === 2
            ? "grid-cols-2"
            : items.length === 3
              ? "grid-cols-2 sm:grid-cols-3"
              : "grid-cols-2 sm:grid-cols-4"
      }`}
    >
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}

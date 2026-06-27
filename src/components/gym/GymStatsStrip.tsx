import { Calendar, Dumbbell, Star, Users, UserRound } from "lucide-react";
import type { GymProfileStat } from "@/lib/gym-stats";
import { cn } from "@/lib/utils";

const STAT_ICONS: Record<string, React.ReactNode> = {
  established: <Calendar className="h-4 w-4 shrink-0 text-[#FF6A3D]" />,
  members: <Users className="h-4 w-4 shrink-0 text-[#FF6A3D]" />,
  trainers: <UserRound className="h-4 w-4 shrink-0 text-[#FF6A3D]" />,
  machines: <Dumbbell className="h-4 w-4 shrink-0 text-[#FF6A3D]" />,
  rating: <Star className="h-4 w-4 shrink-0 fill-[#FF6A3D] text-[#FF6A3D]" />,
};

interface GymStatsStripProps {
  stats: GymProfileStat[];
}

export function GymStatsStrip({ stats }: GymStatsStripProps) {
  if (stats.length === 0) return null;

  return (
    <section aria-label="Gym stats" className="min-w-0">
      <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-3 flex items-center gap-2">
        <Star className="h-4 w-4 fill-[#FF6A3D] text-[#FF6A3D]" aria-hidden />
        Gym Stats
      </h2>

      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="flex min-w-max sm:min-w-0 sm:w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {stats.map((stat, index) => (
            <div
              key={stat.key}
              className={cn(
                "flex flex-1 min-w-[9.5rem] flex-col items-center justify-center gap-1.5 px-4 py-4 text-center sm:min-w-0",
                index < stats.length - 1 && "border-r border-[var(--border)]"
              )}
            >
              <span className="inline-flex">{STAT_ICONS[stat.key]}</span>
              <span
                className={cn(
                  "font-heading font-bold text-xl font-mono-nums whitespace-nowrap",
                  stat.highlight ? "text-[#FF6A3D]" : "text-[var(--text)]"
                )}
              >
                {stat.value}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

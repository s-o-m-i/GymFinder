import Link from "next/link";
import { GymTypeIcon } from "@/components/ui/GymTypeIcon";
import { getGymsBasePath } from "@/lib/gyms-routes";
import { formatHeroStatCount, type DisciplineCardData } from "@/lib/hero-data";
import { cn } from "@/lib/utils";

interface DisciplinesSectionProps {
  disciplines: DisciplineCardData[];
}

export function DisciplinesSection({ disciplines }: DisciplinesSectionProps) {
  return (
    <section id="disciplines" className="bg-[var(--bg)] py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">
          Disciplines
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {disciplines.map((item) => (
            <Link
              key={item.type}
              href={getGymsBasePath({ type: item.type })}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow hover:border-[#FF6A3D]/30 hover:shadow-md transition-all duration-200"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105",
                  item.glow === "orange"
                    ? "bg-[#FF6A3D]/10 shadow-[0_0_16px_rgba(255,106,61,0.15)]"
                    : "bg-blue-500/10 shadow-[0_0_16px_rgba(59,130,246,0.12)]"
                )}
              >
                <GymTypeIcon
                  type={item.type}
                  className={cn(
                    "w-5 h-5",
                    item.glow === "orange" ? "text-[#FF6A3D]" : "text-blue-500"
                  )}
                />
              </div>
              <h3 className="font-heading font-bold text-[var(--text)] mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4 min-h-10">
                {item.description}
              </p>
              <span className="inline-block text-xs font-medium text-[var(--text-muted)] border border-[var(--border)] rounded-full px-2.5 py-1">
                {formatHeroStatCount(item.listings)} Listings
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

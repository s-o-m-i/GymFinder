import Link from "next/link";
import { GYM_TYPES } from "@/lib/constants";
import { GymTypeIcon } from "@/components/ui/GymTypeIcon";

export function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--text)] mb-3">
          Browse by Discipline
        </h2>
        <p className="text-[var(--text-muted)] max-w-xl mx-auto">
          Whether you train for fitness or competition, we have every discipline covered.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {GYM_TYPES.map((type) => (
          <Link
            key={type.value}
            href={`/gyms?type=${type.value}`}
            className="group flex flex-col items-center gap-3 p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:border-[#FF6A3D]/50 hover:bg-[#FF6A3D]/5 transition-all duration-200 card-shadow hover:shadow-md text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0B2545]/6 group-hover:bg-[#FF6A3D]/15 flex items-center justify-center transition-colors duration-200">
              <GymTypeIcon
                type={type.value}
                className="w-5 h-5 text-[#0B2545] group-hover:text-[#FF6A3D] transition-colors duration-200"
              />
            </div>
            <span className="font-heading font-semibold text-sm text-[var(--text)] group-hover:text-[#FF6A3D] transition-colors">
              {type.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

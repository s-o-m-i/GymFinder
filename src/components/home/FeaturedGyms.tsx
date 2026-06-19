import Link from "next/link";
import { GymCard } from "@/components/gym/GymCard";
import { ArrowRight } from "lucide-react";
import type { GymCardData } from "@/types";

interface FeaturedGymsProps {
  gyms: GymCardData[];
}

export function FeaturedGyms({ gyms }: FeaturedGymsProps) {
  if (gyms.length === 0) return null;

  return (
    <section className="bg-[var(--bg)] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-[#FF6A3D] rounded-full" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Top Picks
              </span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--text)]">
              Featured Gyms &  Fighting Clubs
            </h2>
          </div>
          <Link
            href="/gyms"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#FF6A3D] hover:text-[#e85528] transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gyms.map((gym) => (
            <GymCard key={gym.id} gym={gym} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/gyms"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6A3D] text-white font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
          >
            Browse All Gyms
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

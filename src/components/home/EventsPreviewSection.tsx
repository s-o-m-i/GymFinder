import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeEventCard } from "@/components/home/HomeEventCard";
import type { HomeEventPreview } from "@/lib/home-data";

interface EventsPreviewSectionProps {
  events: HomeEventPreview[];
}

export function EventsPreviewSection({ events }: EventsPreviewSectionProps) {
  return (
    <section className="bg-[var(--bg)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Fitness Events Pakistan
            </p>
            <h2 className="font-heading text-2xl font-bold text-[var(--text)] sm:text-3xl">
              Upcoming Fitness Events
            </h2>
            <p className="mt-3 max-w-xl text-sm text-[var(--text-muted)]">
              Boxing tournaments, MMA fight nights, seminars, and fitness expos across Pakistan.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF6A3D] hover:text-[#e85528] transition-colors"
          >
            All events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {events.slice(0, 4).map((event) => (
            <HomeEventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

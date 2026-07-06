import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeEventCard } from "@/components/home/HomeEventCard";
import type { HomeEventPreview } from "@/lib/home-data";

interface EventsPreviewSectionProps {
  events: HomeEventPreview[];
}

export function EventsPreviewSection({ events }: EventsPreviewSectionProps) {
  return (
    <section id="upcoming-events" data-section="events" className="bg-[#0B2545] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-reveal className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Fitness Events Pakistan
            </p>
            <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
              Upcoming Fitness Events
            </h2>
            <p className="mt-3 text-sm text-white/65">
              Boxing tournaments, MMA fight nights, seminars, and fitness expos across Pakistan.
            </p>
          </div>

          <Link
            href="/events"
            className="hidden shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#FF6A3D]/50 hover:text-[#FF6A3D] sm:inline-flex"
          >
            All events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div data-stagger-events className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
          {events.slice(0, 4).map((event) => (
            <HomeEventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="mt-8 text-center sm:mt-10">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full bg-[#FF6A3D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF6A3D]/25 transition-colors hover:bg-[#e85528] sm:hidden"
          >
            All events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

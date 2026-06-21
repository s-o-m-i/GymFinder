import Link from "next/link";
import { EventCard } from "@/components/events/EventCard";
import type { EventCardData } from "@/services/events/event.service";
import { CalendarDays } from "lucide-react";

interface GymEventsSectionProps {
  upcoming: EventCardData[];
  past: EventCardData[];
  gymName: string;
}

export function GymEventsSection({ upcoming, past, gymName }: GymEventsSectionProps) {
  if (upcoming.length === 0 && past.length === 0) return null;

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="font-heading font-bold text-lg text-[var(--text)] flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#FF6A3D]" />
              Upcoming Events
            </h2>
            <Link href="/events" className="text-sm font-semibold text-[#FF6A3D] hover:underline shrink-0">
              Browse all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-2 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[var(--text-muted)]" />
            Past Events
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Previous events hosted by {gymName}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

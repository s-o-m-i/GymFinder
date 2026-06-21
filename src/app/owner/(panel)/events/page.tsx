export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, PlusCircle } from "lucide-react";
import { getOwnerSession } from "@/lib/owner-auth";
import { getOwnerEvents } from "@/services/events/event.service";
import { getEventStatus } from "@/lib/event-status";
import { eventTypeLabel, EVENT_STATUS_LABELS } from "@/lib/event-constants";
import { getEventDetailPath } from "@/lib/events-routes";
import { formatEventDateRange } from "@/components/events/EventCard";

export default async function OwnerEventsPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const events = await getOwnerEvents(session.ownerId);

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-6 h-6 text-[#FF6A3D]" />
            <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Events</h1>
          </div>
          <p className="text-[var(--text-muted)] text-sm">
            Create and manage events linked to your gym. Past events stay visible for SEO.
          </p>
        </div>
        <Link
          href="/owner/events/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Create event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-10 text-center">
          <CalendarDays className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-40" />
          <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-2">No events yet</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
            Promote sparring nights, seminars, and competitions to attract new members.
          </p>
          <Link
            href="/owner/events/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528]"
          >
            <PlusCircle className="w-4 h-4" />
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const status = getEventStatus(event.startDate, event.endDate);
            return (
              <Link
                key={event.id}
                href={getEventDetailPath(event.slug)}
                target="_blank"
                className="block bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-[#FF6A3D]/30 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading font-bold text-[var(--text)]">{event.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      {eventTypeLabel(event.type)} · {formatEventDateRange(event.startDate, event.endDate)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)]">
                    {EVENT_STATUS_LABELS[status]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

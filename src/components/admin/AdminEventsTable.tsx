"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Trash2, Edit, ExternalLink, CalendarDays, Star } from "lucide-react";
import { getEventStatus } from "@/lib/event-status";
import { eventTypeLabel, EVENT_STATUS_LABELS } from "@/lib/event-constants";
import { getEventDetailPath } from "@/lib/events-routes";
import { formatEventDateRange } from "@/components/events/EventCard";
import { cn } from "@/lib/utils";
import type { EventType } from "@prisma/client";

export interface AdminEventRow {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  city: string;
  area: string | null;
  gym: { id: string; name: string } | null;
  createdByOwner: { name: string } | null;
  startDate: string;
  endDate: string | null;
  isFeatured: boolean;
}

const selectClass =
  "px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]";

export function AdminEventsTable({ events }: { events: AdminEventRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter((event) =>
      [event.title, event.city, event.gym?.name ?? "", event.createdByOwner?.name ?? "", event.slug]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [events, search]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this event? This cannot be undone.");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // no-op
    }
  }

  return (
    <div>
      <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3 justify-between">
        <input
          type="search"
          placeholder="Search title, city, gym, owner…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
              <th className="text-left px-5 py-3 font-semibold text-[var(--text-muted)]">Event</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--text-muted)]">City</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--text-muted)]">Gym</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--text-muted)]">Owner</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--text-muted)]">Type</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--text-muted)]">Dates</th>
              <th className="text-right px-5 py-3 font-semibold text-[var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event) => {
              const status = getEventStatus(new Date(event.startDate), event.endDate ? new Date(event.endDate) : null);
              return (
                <tr key={event.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)]/50">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[var(--text)]">{event.title}</div>
                    <div className="text-xs text-[var(--text-muted)]">{event.slug}</div>
                  </td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">{event.city}</td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">{event.gym?.name ?? "—"}</td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">{event.createdByOwner?.name ?? "Admin"}</td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">{eventTypeLabel(event.type)}</td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">
                    {formatEventDateRange(new Date(event.startDate), event.endDate ? new Date(event.endDate) : null)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {event.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF4E5] text-[#A95A16] border border-[#F5D0A9]">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      )}
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                        status === "upcoming"
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      )}>
                        <CalendarDays className="w-3 h-3" /> {EVENT_STATUS_LABELS[status]}
                      </span>
                      <Link
                        href={getEventDetailPath(event.slug)}
                        target="_blank"
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[#FF6A3D] hover:bg-[#FF6A3D]/10"
                        title="View event"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#0B2545] border border-[var(--border)] rounded-lg hover:border-[#FF6A3D]/40 hover:bg-[#FF6A3D]/5 transition-colors"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(event.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-[var(--text-muted)]">No events match your search.</div>
      )}
    </div>
  );
}

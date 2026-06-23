import { getEventStatus } from "@/lib/event-status";
import {
  eventTypeLabel,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_STYLES,
} from "@/lib/event-constants";
import type { EventCardData } from "@/services/events/event.service";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import { getEventDetailPath } from "@/lib/events-routes";

function formatEventDateRange(startDate: Date, endDate: Date | null) {
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const start = new Date(startDate).toLocaleString("en-PK", opts);
  if (!endDate) return start;
  const end = new Date(endDate).toLocaleString("en-PK", opts);
  return `${start} – ${end}`;
}

function formatEventPrice(price: number | null) {
  if (price == null || price === 0) return "Free";
  return `PKR ${price.toLocaleString()}`;
}

interface EventCardProps {
  event: EventCardData;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const status = getEventStatus(event.startDate, event.endDate);
  const location = [event.area, event.city].filter(Boolean).join(", ");

  return (
    <Link
      href={getEventDetailPath(event.slug)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] card-shadow transition-all duration-200 hover:border-[#FF6A3D]/35 hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
    >
      <div className="relative aspect-[16/10] bg-[var(--bg)] overflow-hidden">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545] to-[#1a4080] flex items-center justify-center">
            <Calendar className="w-10 h-10 text-white/20" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0B2545]/85 text-white backdrop-blur-sm">
            {eventTypeLabel(event.type)}
          </span>
          {event.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FF6A3D] text-white">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>
        <span
          className={cn(
            "absolute top-3 right-3 inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm",
            EVENT_STATUS_STYLES[status]
          )}
        >
          {EVENT_STATUS_LABELS[status]}
        </span>
      </div>
{/* somi */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading font-bold text-[var(--text)] mb-2 line-clamp-2 group-hover:text-[#FF6A3D] transition-colors">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-sm text-[var(--text-muted)] mb-4">
          <p className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0 text-[#FF6A3D]" />
            <span className="line-clamp-2">{formatEventDateRange(event.startDate, event.endDate)}</span>
          </p>
          {location && (
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0 text-[#FF6A3D]" />
              {location}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <span className="text-sm font-semibold text-[var(--text)]">
            {formatEventPrice(event.price)}
          </span>
          <span className="text-sm font-semibold text-[#FF6A3D] group-hover:underline">
            View Details →
          </span>
        </div>

        {event.gym && (
          <p className="text-xs text-[var(--text-muted)] mt-2 truncate">
            Hosted by {event.gym.name}
          </p>
        )}
      </div>
    </Link>
  );
}

export { formatEventDateRange, formatEventPrice };

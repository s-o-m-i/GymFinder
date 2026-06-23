import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import { getEventDetailPath } from "@/lib/events-routes";
import type { HomeEventPreview } from "@/lib/home-data";
import { cn } from "@/lib/utils";

interface HomeEventCardProps {
  event: HomeEventPreview;
  className?: string;
}

export function HomeEventCard({ event, className }: HomeEventCardProps) {
  const href = event.id.startsWith("mock-") ? "/events" : getEventDetailPath(event.slug);

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] card-shadow transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6A3D]/35 hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#0B2545]">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545] to-[#1a4080]" />
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#0B2545]/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {event.type}
          </span>
          {event.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6A3D] px-2.5 py-1 text-xs font-semibold text-white">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading mb-3 line-clamp-2 text-lg font-bold text-[var(--text)] group-hover:text-[#FF6A3D] transition-colors">
          {event.name}
        </h3>

        <div className="mb-4 space-y-2 text-sm text-[var(--text-muted)]">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-[#FF6A3D]" />
            {event.city}
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-[#FF6A3D]" />
            {event.date}
          </p>
        </div>

        <span className="mt-auto text-sm font-semibold text-[#FF6A3D] group-hover:underline">
          View Details →
        </span>
      </div>
    </Link>
  );
}

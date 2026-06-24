import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import { getEventDetailPath } from "@/lib/events-routes";
import type { HomeEventPreview } from "@/lib/home-data";
import { optimizedImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

interface HomeEventCardProps {
  event: HomeEventPreview;
  className?: string;
}

export function HomeEventCard({ event, className }: HomeEventCardProps) {
  const href = event.id.startsWith("mock-") ? "/events" : getEventDetailPath(event.slug);
  const image = event.image ? optimizedImageUrl(event.image, { width: 700, quality: 82 }) : null;

  return (
    <article
      className={cn(
        "group relative aspect-[4/5] overflow-hidden rounded-[20px] bg-[#1c1c1c] ring-1 ring-white/5 transition-all duration-300 hover:ring-[#FF6A3D]/45 sm:rounded-[22px]",
        className
      )}
    >
      <Link href={href} className="absolute inset-0 block">
        {image ? (
          <Image
            src={image}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545] via-[#122d52] to-[#1a4080]">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_15%,#FF6A3D_0%,transparent_45%),radial-gradient(circle_at_15%_85%,#FF6A3D_0%,transparent_40%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading text-5xl font-bold text-white/20">
                {event.name.charAt(0)}
              </span>
            </div>
          </div>
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-black/10"
          aria-hidden
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
          <span className="rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:text-xs">
            {event.type}
          </span>
          {event.featured && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#FF6A3D] px-2.5 py-1 text-[11px] font-semibold text-white sm:text-xs">
              <Sparkles className="h-3 w-3" aria-hidden />
              Featured
            </span>
          )}
        </div>

        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:right-4 sm:top-4 sm:text-xs">
          <Calendar className="h-3.5 w-3.5 text-[#FF6A3D]" aria-hidden />
          {event.date}
        </span>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <h3 className="font-heading line-clamp-2 text-base font-bold uppercase leading-tight tracking-wide text-white sm:text-lg">
              {event.name}
            </h3>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-white/75 sm:text-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#FF6A3D]" aria-hidden />
              <span className="truncate">{event.city}</span>
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#0B2545] transition-colors group-hover:bg-[#FF6A3D] group-hover:text-white sm:px-4 sm:text-sm">
            View Details
          </span>
        </div>
      </Link>
    </article>
  );
}

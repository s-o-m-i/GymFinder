import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Clock, ChevronRight, Navigation } from "lucide-react";
import { WhatsAppButton } from "@/components/gym/WhatsAppButton";
import { GymTypeIcon } from "@/components/ui/GymTypeIcon";
import { LadiesStatusBadge } from "@/components/ui/LadiesStatusBadge";
import { getGymCoverUrl, optimizedImageUrl } from "@/lib/images";
import { formatPriceShort, gymTypeLabel } from "@/lib/utils";
import { formatDistance } from "@/lib/getDistance";
import type { GymCardData } from "@/types";

interface GymCardProps {
  gym: GymCardData;
  distanceKm?: number;
}

export function GymCard({ gym, distanceKm }: GymCardProps) {
  const coverUrl = getGymCoverUrl(gym);
  const coverImage = coverUrl ? optimizedImageUrl(coverUrl, { width: 600, quality: 80 }) : undefined;
  const disciplineNames = gym.disciplines.map((d) => d.discipline.name);

  return (
    <article
      className="group relative bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[#FF6A3D]/30 transition-all duration-300 flex flex-col"
      style={{ boxShadow: "0 1px 3px rgba(11,37,69,0.06), 0 2px 8px rgba(11,37,69,0.06)" }}
    >
      {/* ── Image ── */}
      <Link
        href={`/gyms/${gym.slug}`}
        className="block relative overflow-hidden bg-[#0B2545]"
        style={{ height: "200px" }}
      >
        {coverImage ? (
          <Image
            src={coverImage}
            alt={gym.name}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545] via-[#0f3060] to-[#1a4080] flex items-center justify-center">
            <GymTypeIcon type={gym.type} className="w-16 h-16 text-white/30" />
          </div>
        )}

        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* TOP-LEFT: Featured badge */}
        {gym.featured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FF6A3D] text-white text-[11px] font-bold uppercase tracking-wide shadow-md">
              <Star className="w-3 h-3 fill-white" />
              Featured
            </span>
          </div>
        )}

        {/* TOP-RIGHT: Type badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-sm text-white text-[11px] font-semibold">
            <GymTypeIcon type={gym.type} className="w-3.5 h-3.5" />
            {gymTypeLabel(gym.type, gym.customTypeLabel)}
          </span>
        </div>

        {/* BOTTOM: Name + price overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8">
          <div className="flex items-end justify-between gap-2">
            <h3 className="font-heading font-bold text-white text-[15px] leading-tight drop-shadow-sm line-clamp-2">
              {gym.name}
            </h3>
            <div className="shrink-0 font-mono-nums font-bold text-[13px] text-white bg-[#FF6A3D] px-2.5 py-1 rounded-lg shadow whitespace-nowrap">
              {formatPriceShort(gym.priceMin, gym.priceMax)}
            </div>
          </div>
        </div>
      </Link>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4">

        {/* Location + rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs min-w-0">
            <MapPin className="w-3 h-3 shrink-0 text-[#FF6A3D]" />
            <span className="truncate">{gym.area}, {gym.city}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {distanceKm !== undefined && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0B2545] text-white text-[11px] font-semibold rounded-full font-mono-nums">
                <Navigation className="w-2.5 h-2.5" />
                {formatDistance(distanceKm)}
              </span>
            )}
            {gym.rating ? (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-mono-nums text-xs font-bold text-[var(--text)]">
                  {gym.rating.toFixed(1)}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--border)] mb-3" />

        {/* Disciplines */}
        {disciplineNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {disciplineNames.slice(0, 3).map((name) => (
              <span
                key={name}
                className="px-2 py-0.5 text-[11px] font-medium bg-[#0B2545]/6 text-[#0B2545] border border-[#0B2545]/10 rounded-md"
              >
                {name}
              </span>
            ))}
            {disciplineNames.length > 3 && (
              <span className="px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded-md">
                +{disciplineNames.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta row: hours + ladies status */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {gym.openingHours && (
            <div className="flex items-center gap-1 text-[var(--text-muted)] text-[11px]">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[130px]">{gym.openingHours}</span>
            </div>
          )}
          {gym.ladiesStatus !== "men_only" && (
            <LadiesStatusBadge status={gym.ladiesStatus} />
          )}
        </div>

        {/* ── CTA row ── */}
        <div className="mt-auto pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-2">
          <Link
            href={`/gyms/${gym.slug}`}
            className="flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold text-[#0B2545] bg-[var(--bg)] border border-[var(--border)] rounded-xl hover:bg-[#0B2545] hover:text-white hover:border-[#0B2545] transition-all duration-150 group/btn"
          >
            View Details
            <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
          <WhatsAppButton
            number={gym.whatsappNumber}
            gymName={gym.name}
            size="sm"
            className="h-9 text-xs rounded-xl"
          />
        </div>
      </div>
    </article>
  );
}

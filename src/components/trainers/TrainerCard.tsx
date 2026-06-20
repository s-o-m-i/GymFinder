import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ChevronRight, BadgeCheck, Sparkles, MessageCircle } from "lucide-react";
import {
  specializationLabel,
  formatHourlyRate,
  buildTrainerWhatsAppUrl,
} from "@/lib/trainer-constants";
import { optimizedImageUrl } from "@/lib/images";
import type { TrainerCardData } from "@/services/trainer/trainer.service";

interface TrainerCardProps {
  trainer: TrainerCardData;
}

export function TrainerCard({ trainer }: TrainerCardProps) {
  const image = trainer.profileImage
    ? optimizedImageUrl(trainer.profileImage, { width: 600, quality: 80 })
    : null;

  const whatsappUrl = trainer.whatsappNumber
    ? buildTrainerWhatsAppUrl(trainer.whatsappNumber, trainer.fullName)
    : null;

  return (
    <article
      className="group relative bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[#FF6A3D]/30 transition-all duration-300 flex flex-col"
      style={{ boxShadow: "0 1px 3px rgba(11,37,69,0.06), 0 2px 8px rgba(11,37,69,0.06)" }}
    >
      <Link
        href={`/trainer/${trainer.slug}`}
        className="block relative overflow-hidden bg-[#0B2545]"
        style={{ height: "200px" }}
      >
        {image ? (
          <Image
            src={image}
            alt={trainer.fullName}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545] via-[#0f3060] to-[#1a4080] flex items-center justify-center">
            <span className="text-5xl font-heading font-bold text-white/25">
              {trainer.fullName.charAt(0)}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        {(trainer.isFeatured || trainer.isVerified) && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-1.5rem)]">
            {trainer.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FF6A3D] text-white text-[11px] font-bold uppercase tracking-wide shadow-md">
                <Sparkles className="w-3 h-3 shrink-0" />
                Featured
              </span>
            )}
            {trainer.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/95 text-[#0B2545] text-[11px] font-bold shadow-md">
                <BadgeCheck className="w-3 h-3 shrink-0 text-[#FF6A3D]" />
                Verified
              </span>
            )}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8">
          <div className="flex items-end justify-between gap-2">
            <h3 className="font-heading font-bold text-white text-[15px] leading-tight drop-shadow-sm line-clamp-2">
              {trainer.fullName}
            </h3>
            <div className="shrink-0 font-mono-nums font-bold text-[13px] text-white bg-[#FF6A3D] px-2.5 py-1 rounded-lg shadow whitespace-nowrap">
              {formatHourlyRate(trainer.hourlyRate)}
            </div>
          </div>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4">
        {trainer.specialization && (
          <span className="inline-flex self-start max-w-full px-2 py-0.5 mb-2 text-[11px] font-semibold bg-[#0B2545]/6 text-[#0B2545] border border-[#0B2545]/10 rounded-md truncate">
            {specializationLabel(trainer.specialization)}
          </span>
        )}

        {trainer.headline && (
          <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">{trainer.headline}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs min-w-0">
            <MapPin className="w-3 h-3 shrink-0 text-[#FF6A3D]" />
            <span className="truncate">
              {trainer.area ? `${trainer.area}, ` : ""}
              {trainer.city}
            </span>
          </div>
          {trainer.rating != null && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-mono-nums text-xs font-bold text-[var(--text)]">
                {trainer.rating.toFixed(1)}
              </span>
              {trainer.totalReviews > 0 && (
                <span className="text-[11px] text-[var(--text-muted)]">({trainer.totalReviews})</span>
              )}
            </div>
          )}
        </div>

        {trainer.experienceYears != null && (
          <p className="text-xs text-[var(--text-muted)] mb-3">
            {trainer.experienceYears}+ years experience
          </p>
        )}

        {trainer.gym && (
          <p className="text-xs text-[#0B2545] bg-[#0B2545]/5 border border-[#0B2545]/10 rounded-lg px-2.5 py-1.5 mb-3 truncate">
            Affiliated with{" "}
            <Link href={`/gyms/${trainer.gym.slug}`} className="font-semibold hover:underline">
              {trainer.gym.name}
            </Link>
          </p>
        )}

        <div
          className={`mt-auto pt-3 border-t border-[var(--border)] ${
            whatsappUrl ? "grid grid-cols-2 gap-2" : ""
          }`}
        >
          <Link
            href={`/trainer/${trainer.slug}`}
            className="flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold text-[#0B2545] bg-[var(--bg)] border border-[var(--border)] rounded-xl hover:bg-[#0B2545] hover:text-white hover:border-[#0B2545] transition-all duration-150 group/btn w-full"
          >
            View Profile
            <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-trainer-id={trainer.id}
              data-lead-event="WHATSAPP_CLICK"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold bg-[#25D366] text-white rounded-xl hover:bg-[#1da851] active:scale-[0.97] transition-all duration-150 w-full"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import type { SuccessStoryCard } from "@/services/success-story/success-story.service";
import { getSuccessStoryPath } from "@/lib/success-stories-routes";
import { optimizedImageUrl } from "@/lib/images";
import {
  SUCCESS_STORY_GOAL_LABELS,
  SUCCESS_STORY_PUBLISHER_EMOJI,
  SUCCESS_STORY_PUBLISHER_LABELS,
} from "@/lib/success-stories/types";
import { cn } from "@/lib/utils";

interface SuccessStoryCardProps {
  story: SuccessStoryCard;
  className?: string;
  priority?: boolean;
}

function StoryThumbnail({
  beforeSrc,
  afterSrc,
  clientName,
  priority = false,
}: {
  beforeSrc: string;
  afterSrc: string;
  clientName: string;
  priority?: boolean;
}) {
  const thumbWidth = 800;
  const thumbHeight = 500;

  return (
    <div className="relative aspect-[16/10] overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-2">
        <div className="relative min-h-0">
          <Image
            src={optimizedImageUrl(beforeSrc, { width: thumbWidth, height: thumbHeight })}
            alt={`${clientName} before`}
            fill
            unoptimized
            className="object-cover object-center"
            sizes="(max-width: 768px) 50vw, 16vw"
            priority={priority}
          />
        </div>
        {afterSrc ? (
          <div className="relative min-h-0 border-l border-white/25">
            <Image
              src={optimizedImageUrl(afterSrc, { width: thumbWidth, height: thumbHeight })}
              alt={`${clientName} after`}
              fill
              unoptimized
              className="object-cover object-center"
              sizes="(max-width: 768px) 50vw, 16vw"
            />
          </div>
        ) : (
          <div className="relative min-h-0 border-l border-white/25 bg-[#1c1c1c]" />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/30" />
    </div>
  );
}

export function SuccessStoryCardTile({ story, className, priority = false }: SuccessStoryCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[20px] bg-[#1c1c1c] ring-1 ring-[var(--border)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:ring-[#FF6A3D]/40",
        className
      )}
    >
      <Link href={getSuccessStoryPath(story.slug)} className="block">
        <div className="relative">
          <StoryThumbnail
            beforeSrc={story.beforeImageUrl}
            afterSrc={story.afterImageUrl}
            clientName={story.clientName}
            priority={priority}
          />

          <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {SUCCESS_STORY_PUBLISHER_EMOJI[story.publisherType]}{" "}
              {SUCCESS_STORY_PUBLISHER_LABELS[story.publisherType]}
            </span>
            {story.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/90 px-2.5 py-1 text-[11px] font-semibold text-white">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </span>
            )}
            {story.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#FF6A3D] px-2.5 py-1 text-[11px] font-semibold text-white">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#FF6A3D]">
              {SUCCESS_STORY_GOAL_LABELS[story.goal]} · {story.duration}
            </p>
            <h3 className="font-heading mt-1 line-clamp-2 text-base font-bold text-white sm:text-lg">
              {story.title}
            </h3>
            <p className="mt-1 text-xs text-white/75 sm:text-sm">
              {story.clientName} · {story.city}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/90 group-hover:text-[#FF6A3D]">
              Read journey
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

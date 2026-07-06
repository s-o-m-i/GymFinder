"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck } from "lucide-react";
import type { HomeSuccessStory } from "@/services/success-story/success-story.service";
import { getSuccessStoryPath } from "@/lib/success-stories-routes";
import { optimizedImageUrl } from "@/lib/images";
import {
  SUCCESS_STORY_GOAL_LABELS,
  SUCCESS_STORY_PUBLISHER_LABELS,
} from "@/lib/success-stories/types";
import { formatWeightLostLabel } from "@/lib/success-stories/home-showcase";
import { cn } from "@/lib/utils";

interface HomeSuccessStoryCardProps {
  story: HomeSuccessStory;
  className?: string;
  priority?: boolean;
}

function CardCover({ story, priority }: { story: HomeSuccessStory; priority?: boolean }) {
  const coverSrc =
    story.coverImageUrl ?? story.afterImageUrl ?? story.beforeImageUrl;

  return (
    <div
      data-success-stories-card-image
      className="relative aspect-[16/10] overflow-hidden bg-[#f0f2f5]"
    >
      <Image
        src={optimizedImageUrl(coverSrc, { width: 800, height: 500 })}
        alt={`${story.clientName} fitness transformation — ${story.title}`}
        fill
        unoptimized
        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 30vw"
        priority={priority}
        loading={priority ? undefined : "lazy"}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B2545]/75 via-[#0B2545]/15 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
    </div>
  );
}

export function HomeSuccessStoryCard({ story, className, priority }: HomeSuccessStoryCardProps) {
  const weightLost = formatWeightLostLabel(
    story.startWeight,
    story.currentWeight,
    story.weightUnit
  );

  return (
    <article
      data-success-stories-card
      data-story-id={story.id}
      className={cn("group perspective-[1000px]", className)}
    >
      <div
        data-success-stories-card-inner
        className="flex h-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_8px_30px_rgba(11,37,69,0.08)] ring-1 ring-[#0B2545]/8 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_50px_rgba(255,106,61,0.18)] group-hover:ring-[#FF6A3D]/35"
      >
        <Link href={getSuccessStoryPath(story.slug)} className="block">
          <div className="relative">
            <CardCover story={story} priority={priority} />

            <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0B2545] shadow-sm">
                {SUCCESS_STORY_GOAL_LABELS[story.goal]}
              </span>
              <span className="rounded-full bg-[#0B2545]/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                {SUCCESS_STORY_PUBLISHER_LABELS[story.publisherType]}
              </span>
              {story.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold text-white">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col p-4 sm:p-5">
            <h3 className="font-heading line-clamp-2 text-base font-bold text-[#0B2545] sm:text-lg">
              {story.title}
            </h3>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-[#5a6b7d]">
              {weightLost && (
                <span className="rounded-lg bg-[#FFF4EF] px-2 py-1 text-[#FF6A3D]">
                  {weightLost} lost
                </span>
              )}
              <span className="rounded-lg bg-[#f4f6f9] px-2 py-1">{story.duration}</span>
              <span className="rounded-lg bg-[#f4f6f9] px-2 py-1">{story.city}</span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {story.linkedTrainer?.profileImage && (
                  <Image
                    src={optimizedImageUrl(story.linkedTrainer.profileImage, { width: 64, height: 64 })}
                    alt={story.linkedTrainer.fullName}
                    width={28}
                    height={28}
                    unoptimized
                    className="h-7 w-7 rounded-full object-cover ring-2 ring-white"
                  />
                )}
                {story.linkedGym?.coverImage && (
                  <Image
                    src={optimizedImageUrl(story.linkedGym.coverImage, { width: 64, height: 64 })}
                    alt={story.linkedGym.name}
                    width={28}
                    height={28}
                    unoptimized
                    className="h-7 w-7 rounded-lg object-cover ring-2 ring-white"
                  />
                )}
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A3D] transition-transform group-hover:translate-x-0.5">
                Read Journey
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Link>

        {/* Future: likes, comments, saves */}
        <div data-story-actions className="hidden" aria-hidden />
      </div>
    </article>
  );
}

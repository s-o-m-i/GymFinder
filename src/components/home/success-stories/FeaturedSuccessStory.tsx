"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import type { HomeSuccessStory } from "@/services/success-story/success-story.service";
import { getSuccessStoryPath } from "@/lib/success-stories-routes";
import {
  SUCCESS_STORY_GOAL_LABELS,
  SUCCESS_STORY_PUBLISHER_LABELS,
} from "@/lib/success-stories/types";
import {
  formatFeaturedHeadline,
  formatWeightLostLabel,
} from "@/lib/success-stories/home-showcase";
import { stripStoryHtml } from "@/lib/success-stories/utils";
import { cn } from "@/lib/utils";

const BeforeAfterCompareSlider = dynamic(
  () =>
    import("@/components/success-stories/BeforeAfterCompareSlider").then(
      (m) => m.BeforeAfterCompareSlider
    ),
  { ssr: false, loading: () => <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-[#e8ecf1]" /> }
);

interface FeaturedSuccessStoryProps {
  story: HomeSuccessStory;
  className?: string;
}

function StatPill({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="rounded-xl bg-white/80 px-3 py-2.5 ring-1 ring-[#0B2545]/8 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5a6b7d]">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-[#0B2545]">{value}</p>
    </div>
  );
}

export function FeaturedSuccessStory({ story, className }: FeaturedSuccessStoryProps) {
  const headline = formatFeaturedHeadline(story);
  const weightLost = formatWeightLostLabel(
    story.startWeight,
    story.currentWeight,
    story.weightUnit
  );
  const preview = stripStoryHtml(story.story).slice(0, 160);
  const publisherLabel =
    story.publisherType === "USER"
      ? "By Community Member"
      : `By ${SUCCESS_STORY_PUBLISHER_LABELS[story.publisherType].replace(" Story", "")}`;

  const beforeWeight =
    story.startWeight != null
      ? `${story.startWeight}${story.weightUnit === "LBS" ? " lbs" : "kg"}`
      : null;
  const afterWeight =
    story.currentWeight != null
      ? `${story.currentWeight}${story.weightUnit === "LBS" ? " lbs" : "kg"}`
      : null;

  return (
    <div
      data-reveal
      className={cn(
        "grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12",
        className
      )}
    >
      <div data-success-stories-featured-media className="relative">
        <BeforeAfterCompareSlider
          beforeSrc={story.beforeImageUrl}
          afterSrc={story.afterImageUrl}
          beforeLabel="BEFORE"
          afterLabel="AFTER"
          bottomBeforeLabel={beforeWeight ?? undefined}
          bottomAfterLabel={afterWeight ?? undefined}
          className="aspect-[4/3] rounded-[24px] border-[#0B2545]/10 shadow-[0_24px_60px_rgba(11,37,69,0.15)]"
        />
      </div>

      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#FFF4EF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#FF6A3D]">
            {SUCCESS_STORY_GOAL_LABELS[story.goal]}
          </span>
          {story.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified Story
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5a6b7d]">
            <MapPin className="h-3.5 w-3.5" />
            {story.city}
          </span>
        </div>

        <h3 className="font-heading mt-4 text-2xl font-bold leading-tight text-[#0B2545] sm:text-3xl lg:text-4xl">
          {headline}
        </h3>

        <p className="mt-2 text-sm font-medium text-[#5a6b7d]">{publisherLabel}</p>

        <p className="mt-4 text-sm leading-relaxed text-[#3d4f63] sm:text-base">
          &ldquo;{preview}
          {preview.length >= 160 ? "…" : ""}&rdquo;
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <StatPill label="Weight Lost" value={weightLost} />
          <StatPill label="Duration" value={story.duration} />
          <StatPill label="Goal" value={SUCCESS_STORY_GOAL_LABELS[story.goal]} />
          {story.linkedTrainer && (
            <StatPill label="Trainer" value={story.linkedTrainer.fullName} />
          )}
          {story.linkedGym && <StatPill label="Gym" value={story.linkedGym.name} />}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={getSuccessStoryPath(story.slug)}
            data-magnetic
            className="inline-flex items-center gap-2 rounded-full bg-[#FF6A3D] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF6A3D]/25 transition-colors hover:bg-[#e85528]"
          >
            Read Full Journey
            <ArrowRight className="h-4 w-4" />
          </Link>
          {story.linkedTrainer && (
            <Link
              href={`/trainers/${story.linkedTrainer.slug}`}
              data-magnetic
              className="inline-flex items-center gap-2 rounded-full border border-[#0B2545]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2545] transition-colors hover:border-[#FF6A3D]/40 hover:text-[#FF6A3D]"
            >
              View Trainer
            </Link>
          )}
          {story.linkedGym && (
            <Link
              href={`/gyms/${story.linkedGym.slug}`}
              data-magnetic
              className="inline-flex items-center gap-2 rounded-full border border-[#0B2545]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2545] transition-colors hover:border-[#FF6A3D]/40 hover:text-[#FF6A3D]"
            >
              View Gym
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

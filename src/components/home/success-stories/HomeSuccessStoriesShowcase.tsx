"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type {
  HomeSuccessStory,
  HomeSuccessStoryCommunityStats,
} from "@/services/success-story/success-story.service";
import { FeaturedSuccessStory } from "@/components/home/success-stories/FeaturedSuccessStory";
import { HomeSuccessStoryCard } from "@/components/home/success-stories/HomeSuccessStoryCard";
import { SuccessStoriesStatsStrip } from "@/components/home/success-stories/SuccessStoriesStatsStrip";
import { SuccessStoriesCtaBanner } from "@/components/home/success-stories/SuccessStoriesCtaBanner";
import { AUTH_PATHS } from "@/lib/nav-config";
import { SUCCESS_STORIES_BASE_PATH } from "@/lib/success-stories-routes";
import {
  filterHomeStories,
  HOME_STORY_GOAL_FILTERS,
  HOME_STORY_SORT_FILTERS,
  type HomeStoryGoalFilterId,
  type HomeStorySortFilterId,
} from "@/lib/success-stories/home-showcase";
import { cn } from "@/lib/utils";

interface HomeSuccessStoriesShowcaseProps {
  featured: HomeSuccessStory | null;
  grid: HomeSuccessStory[];
  stats: HomeSuccessStoryCommunityStats;
}

function DumbbellDecoration() {
  return (
    <svg
      className="pointer-events-none absolute -right-8 top-8 h-56 w-56 text-[#FF6A3D]/[0.06] sm:h-72 sm:w-72 lg:-right-4 lg:top-4 lg:h-96 lg:w-96"
      viewBox="0 0 200 200"
      fill="currentColor"
      aria-hidden
    >
      <rect x="20" y="85" width="30" height="30" rx="6" />
      <rect x="150" y="85" width="30" height="30" rx="6" />
      <rect x="10" y="75" width="20" height="50" rx="8" />
      <rect x="170" y="75" width="20" height="50" rx="8" />
      <rect x="50" y="95" width="100" height="10" rx="5" />
    </svg>
  );
}

export function HomeSuccessStoriesShowcase({
  featured,
  grid,
  stats,
}: HomeSuccessStoriesShowcaseProps) {
  const [goalFilter, setGoalFilter] = useState<HomeStoryGoalFilterId>("all");
  const [sortFilter, setSortFilter] = useState<HomeStorySortFilterId>("latest");

  const allGridStories = useMemo(() => grid, [grid]);

  const filteredStories = useMemo(
    () => filterHomeStories(allGridStories, goalFilter, sortFilter),
    [allGridStories, goalFilter, sortFilter]
  );

  const showFeatured =
    featured &&
    (goalFilter === "all" || filterHomeStories([featured], goalFilter, sortFilter).length > 0) &&
    (sortFilter !== "featured" || featured.isFeatured);

  return (
    <section
      id="success-stories"
      data-section="success-stories"
      className="relative overflow-hidden border-t border-[var(--border)] bg-gradient-to-b from-[#fafbfc] via-white to-[#f8f9fb] py-14 sm:py-16 lg:py-20"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-24 h-48 w-[min(90%,520px)] -translate-x-1/2 rounded-full bg-[#FF6A3D]/10 blur-3xl"
        aria-hidden
      />
      <DumbbellDecoration />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-reveal className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Success Stories
            </p>
            <h2
              data-success-stories-headline
              className="font-heading text-2xl font-bold text-[#0B2545] sm:text-3xl lg:text-4xl"
            >
              Real Fitness Journeys That Inspire Pakistan
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5a6b7d] sm:text-base">
              Discover real transformations from gyms, trainers, and community members across
              Pakistan. Every story is authentic and connected to the people who made it possible.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href={SUCCESS_STORIES_BASE_PATH}
              data-magnetic
              className="inline-flex items-center gap-2 rounded-full border border-[#0B2545]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2545] shadow-sm transition-colors hover:border-[#FF6A3D]/40 hover:text-[#FF6A3D]"
            >
              View All Stories
            </Link>
            <Link
              href={AUTH_PATHS.shareStory}
              data-magnetic
              className="inline-flex items-center gap-2 rounded-full bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#071832]"
            >
              Share Your Story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {showFeatured && featured && (
          <div className="mb-12 lg:mb-14">
            <FeaturedSuccessStory story={featured} />
          </div>
        )}

        <div data-reveal className="space-y-4">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible sm:px-0">
            {HOME_STORY_GOAL_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setGoalFilter(filter.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all sm:text-sm",
                  goalFilter === filter.id
                    ? "bg-[#FF6A3D] text-white shadow-md shadow-[#FF6A3D]/25"
                    : "bg-white text-[#5a6b7d] ring-1 ring-[#0B2545]/10 hover:ring-[#FF6A3D]/30 hover:text-[#0B2545]"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {HOME_STORY_SORT_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSortFilter(filter.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold transition-all sm:text-sm",
                  sortFilter === filter.id
                    ? "bg-[#0B2545] text-white"
                    : "bg-[#f0f2f5] text-[#5a6b7d] hover:bg-[#e8ecf1] hover:text-[#0B2545]"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredStories.length > 0 ? (
          <div
            data-stagger-success-stories
            className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-none sm:mt-10 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 lg:grid-cols-3 lg:gap-6"
          >
            {filteredStories.map((story, index) => (
              <div
                key={story.id}
                data-stagger-item
                className="w-[min(88vw,340px)] shrink-0 snap-center md:w-auto"
              >
                <HomeSuccessStoryCard story={story} priority={index < 2} />
              </div>
            ))}
          </div>
        ) : (
          <div
            data-reveal
            className="mt-8 rounded-2xl border border-dashed border-[#0B2545]/15 bg-white/60 px-6 py-12 text-center sm:mt-10"
          >
            <p className="text-sm font-medium text-[#5a6b7d]">
              No stories match this filter yet. Try another category or explore all journeys.
            </p>
            <Link
              href={SUCCESS_STORIES_BASE_PATH}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#FF6A3D] hover:underline"
            >
              Browse all stories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <SuccessStoriesStatsStrip stats={stats} />
        <SuccessStoriesCtaBanner />
      </div>
    </section>
  );
}

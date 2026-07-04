import Link from "next/link";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SuccessStoryCardTile } from "@/components/success-stories/SuccessStoryCard";
import { CITIES } from "@/lib/constants";
import {
  SUCCESS_STORY_GOAL_LABELS,
  SUCCESS_STORY_PUBLISHER_LABELS,
} from "@/lib/success-stories/types";
import { SUCCESS_STORIES_BASE_PATH } from "@/lib/success-stories-routes";
import type { SuccessStoryCard } from "@/services/success-story/success-story.service";
import { SuccessStoryGender, SuccessStoryGoal } from "@prisma/client";

interface SuccessStoriesListingPageProps {
  stories: SuccessStoryCard[];
  total: number;
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function SuccessStoriesListingPage({
  stories,
  total,
  page,
  totalPages,
  searchParams,
}: SuccessStoriesListingPageProps) {
  function buildHref(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    Object.entries({ ...searchParams, ...params }).forEach(([key, value]) => {
      if (value) sp.set(key, value);
    });
    const qs = sp.toString();
    return qs ? `${SUCCESS_STORIES_BASE_PATH}?${qs}` : SUCCESS_STORIES_BASE_PATH;
  }

  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Real journeys
            </p>
            <h1 className="font-heading text-3xl font-bold text-[var(--text)] sm:text-4xl">
              Success Stories
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Pakistan&apos;s growing collection of fitness transformations — published by gyms,
              trainers, and community members on FitnessAdda.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <form method="get" className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:grid-cols-2 lg:grid-cols-4">
            <input
              name="q"
              defaultValue={searchParams.q}
              placeholder="Search title, client, gym, trainer…"
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm sm:col-span-2 lg:col-span-4"
            />
            <select name="publisherType" defaultValue={searchParams.publisherType} className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm">
              <option value="">All publishers</option>
              {Object.entries(SUCCESS_STORY_PUBLISHER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select name="goal" defaultValue={searchParams.goal} className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm">
              <option value="">All goals</option>
              {Object.entries(SUCCESS_STORY_GOAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select name="city" defaultValue={searchParams.city} className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm">
              <option value="">All cities</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select name="gender" defaultValue={searchParams.gender} className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm">
              <option value="">All genders</option>
              {Object.entries(SuccessStoryGender).map(([value]) => (
                <option key={value} value={value}>{value.replace(/_/g, " ")}</option>
              ))}
            </select>
            <label className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <input type="checkbox" name="verified" value="1" defaultChecked={searchParams.verified === "1"} />
              Verified only
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <input type="checkbox" name="featured" value="1" defaultChecked={searchParams.featured === "1"} />
              Featured only
            </label>
            <button type="submit" className="h-11 rounded-xl bg-[#0B2545] text-sm font-semibold text-white sm:col-span-2">
              Apply filters
            </button>
          </form>

          <p className="mb-5 text-sm text-[var(--text-muted)]">{total} stories found</p>

          {stories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center text-[var(--text-muted)]">
              No success stories match your filters yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {stories.map((story, index) => (
                <SuccessStoryCardTile key={story.id} story={story} priority={index < 3} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {page > 1 && (
                <Link href={buildHref({ page: String(page - 1) })} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">
                  Previous
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-[var(--text-muted)]">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link href={buildHref({ page: String(page + 1) })} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

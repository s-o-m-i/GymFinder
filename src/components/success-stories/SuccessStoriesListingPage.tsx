import Link from "next/link";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SuccessStoryCardTile } from "@/components/success-stories/SuccessStoryCard";
import { SuccessStoriesFiltersForm } from "@/components/success-stories/SuccessStoriesFiltersForm";
import { SUCCESS_STORIES_BASE_PATH } from "@/lib/success-stories-routes";
import type { SuccessStoryCard } from "@/services/success-story/success-story.service";

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
          <SuccessStoriesFiltersForm searchParams={searchParams} />

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

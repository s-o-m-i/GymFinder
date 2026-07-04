import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SuccessStoryCard } from "@/services/success-story/success-story.service";
import { SuccessStoryCardTile } from "@/components/success-stories/SuccessStoryCard";
import { SUCCESS_STORIES_BASE_PATH } from "@/lib/success-stories-routes";

interface SuccessStoriesProfileSectionProps {
  stories: SuccessStoryCard[];
  title?: string;
  description?: string;
}

export function SuccessStoriesProfileSection({
  stories,
  title = "Success Stories",
  description = "Real transformations linked to this profile.",
}: SuccessStoriesProfileSectionProps) {
  if (stories.length === 0) return null;

  return (
    <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-lg text-[var(--text)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
        </div>
        <Link
          href={SUCCESS_STORIES_BASE_PATH}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF6A3D] hover:underline"
        >
          View all stories
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stories.map((story, index) => (
          <SuccessStoryCardTile key={story.id} story={story} priority={index === 0} />
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Sparkles } from "lucide-react";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BeforeAfterCompareSlider } from "@/components/success-stories/BeforeAfterCompareSlider";
import { SuccessStoryCardTile } from "@/components/success-stories/SuccessStoryCard";
import type { SuccessStoryCard, SuccessStoryDetail } from "@/services/success-story/success-story.service";
import {
  SUCCESS_STORY_GOAL_LABELS,
  SUCCESS_STORY_PUBLISHER_EMOJI,
  SUCCESS_STORY_PUBLISHER_LABELS,
} from "@/lib/success-stories/types";
import { calculateWeightLost, parseProgressImages } from "@/lib/success-stories/utils";
import { getUserJourneyPath } from "@/lib/success-stories-routes";

interface SuccessStoryDetailPageProps {
  story: SuccessStoryDetail;
  related: SuccessStoryCard[];
}

export function SuccessStoryDetailPage({ story, related }: SuccessStoryDetailPageProps) {
  const weightLost = calculateWeightLost(story.startWeight, story.currentWeight);
  const progressImages = parseProgressImages(story.progressImages);

  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="relative overflow-hidden bg-[#0B2545] text-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-14">
            <BeforeAfterCompareSlider
              beforeSrc={story.beforeImageUrl}
              afterSrc={story.afterImageUrl}
              bottomBeforeLabel="Before"
              bottomAfterLabel={story.duration}
            />
            <div className="flex flex-col justify-center">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                  {SUCCESS_STORY_PUBLISHER_EMOJI[story.publisherType]}{" "}
                  {SUCCESS_STORY_PUBLISHER_LABELS[story.publisherType]}
                </span>
                {story.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
                {story.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6A3D]/20 px-3 py-1 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5" /> Featured
                  </span>
                )}
              </div>
              <h1 className="font-heading text-3xl font-bold sm:text-4xl">{story.title}</h1>
              <p className="mt-3 text-white/80">
                {story.clientName} · {story.city} · {story.duration}
              </p>
              <p className="mt-2 text-sm text-[#FF6A3D] font-semibold">
                {SUCCESS_STORY_GOAL_LABELS[story.goal]}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
            {[
              { label: "Start weight", value: story.startWeight ? `${story.startWeight} ${story.weightUnit.toLowerCase()}` : "—" },
              { label: "Current weight", value: story.currentWeight ? `${story.currentWeight} ${story.weightUnit.toLowerCase()}` : "—" },
              { label: "Weight lost", value: weightLost ? `${weightLost} ${story.weightUnit.toLowerCase()}` : "—" },
              { label: "Duration", value: story.duration },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{stat.label}</p>
                <p className="mt-1 text-lg font-bold text-[var(--text)]">{stat.value}</p>
              </div>
            ))}
          </div>

          <section className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
            <h2 className="font-heading mb-4 text-xl font-bold text-[var(--text)]">The journey</h2>
            <div className="prose prose-neutral max-w-none whitespace-pre-wrap text-[var(--text-muted)] leading-relaxed">
              {story.story}
            </div>
          </section>

          {progressImages.length > 0 && (
            <section className="mb-8">
              <h2 className="font-heading mb-4 text-xl font-bold text-[var(--text)]">Progress gallery</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {progressImages.map((img) => (
                  <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)]">
                    <Image src={img.imageUrl} alt={img.caption ?? "Progress"} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-10">
            {story.publisherUser && story.publisherType === "USER" && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <p className="text-sm text-[var(--text-muted)]">Published by</p>
                <p className="font-heading mt-1 text-lg font-bold text-[var(--text)]">{story.publisherUser.fullName}</p>
                <Link
                  href={getUserJourneyPath(story.publisherUser.id)}
                  className="mt-3 inline-flex rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)]"
                >
                  View fitness journey
                </Link>
              </div>
            )}
            {story.linkedTrainer && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <p className="text-sm text-[var(--text-muted)]">Coached by</p>
                <p className="font-heading mt-1 text-lg font-bold text-[var(--text)]">{story.linkedTrainer.fullName}</p>
                <Link href={`/trainer/${story.linkedTrainer.slug}`} className="mt-3 inline-flex rounded-xl bg-[#0B2545] px-4 py-2 text-sm font-semibold text-white">
                  View trainer
                </Link>
              </div>
            )}
            {story.linkedGym && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <p className="text-sm text-[var(--text-muted)]">Transformation achieved at</p>
                <p className="font-heading mt-1 text-lg font-bold text-[var(--text)]">{story.linkedGym.name}</p>
                <Link href={`/gyms/${story.linkedGym.slug}`} className="mt-3 inline-flex rounded-xl bg-[#FF6A3D] px-4 py-2 text-sm font-semibold text-white">
                  View gym
                </Link>
              </div>
            )}
          </div>

          {related.length > 0 && (
            <section>
              <h2 className="font-heading mb-5 text-xl font-bold text-[var(--text)]">Related stories</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {related.map((item) => (
                  <SuccessStoryCardTile key={item.id} story={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

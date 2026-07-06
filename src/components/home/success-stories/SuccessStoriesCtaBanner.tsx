import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AUTH_PATHS } from "@/lib/nav-config";
import { SUCCESS_STORIES_BASE_PATH } from "@/lib/success-stories-routes";

export function SuccessStoriesCtaBanner() {
  return (
    <div
      data-success-stories-cta
      className="relative mt-12 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0B2545] via-[#0d2f57] to-[#071832] px-6 py-10 sm:mt-14 sm:px-10 sm:py-12 lg:px-14"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FF6A3D]/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-[#FF6A3D]/15 blur-3xl"
        aria-hidden
      />

      <div className="relative max-w-2xl">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
          <Sparkles className="h-4 w-4" />
          Community
        </p>
        <h3 className="font-heading text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          Your Journey Could Inspire Thousands
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
          Every transformation begins with one decision. Share your fitness story and motivate
          others across Pakistan.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={AUTH_PATHS.shareStory}
            data-magnetic
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6A3D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF6A3D]/30 transition-colors hover:bg-[#e85528]"
          >
            Share Your Story
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={SUCCESS_STORIES_BASE_PATH}
            data-magnetic
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
          >
            Explore Stories
          </Link>
        </div>
      </div>
    </div>
  );
}

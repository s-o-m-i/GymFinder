import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { HomeBlogCard } from "@/components/home/HomeBlogCard";
import { getBlogBasePath, getBlogCategoriesPath } from "@/lib/blogs-routes";
import type { BlogPostSummary } from "@/types/wordpress";

interface BlogPreviewSectionProps {
  posts: BlogPostSummary[];
}

export function BlogPreviewSection({ posts }: BlogPreviewSectionProps) {
  if (posts.length === 0) return null;

  const featuredPosts = posts.slice(0, 4);

  return (
    <section id="latest-articles" data-section="blog" className="border-t border-[var(--border)] bg-[var(--bg)] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-reveal className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Fitness Blog
            </p>
            <h2 className="font-heading text-2xl font-bold text-[var(--text)] sm:text-3xl">
              Latest Articles & Guides
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Expert training tips, nutrition advice, and wellness insights from the FitnessAdda
              team — built for Pakistan&apos;s fitness community.
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            <Link
              href={getBlogCategoriesPath()}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[#FF6A3D]/40 hover:text-[#FF6A3D]"
            >
              <BookOpen className="h-4 w-4" />
              Categories
            </Link>
            <Link
              href={getBlogBasePath()}
              className="inline-flex items-center gap-2 rounded-full bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#071832]"
            >
              All articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div data-stagger-blog className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
          {featuredPosts.map((post, index) => (
            <HomeBlogCard key={post.id} post={post} priority={index === 0} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:hidden">
          <Link
            href={getBlogBasePath()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FF6A3D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF6A3D]/25 transition-colors hover:bg-[#e85528]"
          >
            All articles
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={getBlogCategoriesPath()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[#FF6A3D]/40"
          >
            <BookOpen className="h-4 w-4" />
            Browse categories
          </Link>
        </div>
      </div>
    </section>
  );
}

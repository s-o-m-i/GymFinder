import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Sparkles } from "lucide-react";
import type { BlogPostSummary } from "@/types/wordpress";
import { formatBlogDate, getBlogPostPath } from "@/lib/blogs-routes";
import { formatReadingTime } from "@/utils/readingTime";
import { cn } from "@/lib/utils";

interface HomeBlogCardProps {
  post: BlogPostSummary;
  className?: string;
  priority?: boolean;
}

export function HomeBlogCard({ post, className, priority = false }: HomeBlogCardProps) {
  const primaryCategory = post.categories[0];
  const image = post.featuredMedia?.url ?? null;

  return (
    <article
      className={cn(
        "group relative aspect-4/5 overflow-hidden rounded-[20px] bg-[#1c1c1c] ring-1 ring-[var(--border)] shadow-[0_8px_30px_rgba(11,37,69,0.08)] transition-all duration-300 hover:-translate-y-1 hover:ring-[#FF6A3D]/45 hover:shadow-[0_16px_40px_rgba(11,37,69,0.14)] sm:rounded-[22px]",
        className
      )}
    >
      <Link href={getBlogPostPath(post.slug)} className="absolute inset-0 block">
        {image ? (
          <Image
            src={image}
            alt={post.featuredMedia?.alt || post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545] via-[#122d52] to-[#1a4080]">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_15%,#FF6A3D_0%,transparent_45%),radial-gradient(circle_at_15%_85%,#FF6A3D_0%,transparent_40%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading text-5xl font-bold text-white/20">B</span>
            </div>
          </div>
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10"
          aria-hidden
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
          {primaryCategory ? (
            <span className="rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:text-xs">
              {primaryCategory.name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#FF6A3D] px-2.5 py-1 text-[11px] font-semibold text-white sm:text-xs">
              <Sparkles className="h-3 w-3" aria-hidden />
              Article
            </span>
          )}
        </div>

        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:right-4 sm:top-4 sm:text-xs">
          <Calendar className="h-3.5 w-3.5 text-[#FF6A3D]" aria-hidden />
          {formatBlogDate(post.publishedAt)}
        </span>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <h3 className="font-heading line-clamp-2 text-base font-bold leading-tight text-white sm:text-lg">
              {post.title}
            </h3>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-white/75 sm:text-sm">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#FF6A3D]" aria-hidden />
              <span>{formatReadingTime(post.readingMinutes)}</span>
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#0B2545] transition-colors group-hover:bg-[#FF6A3D] group-hover:text-white sm:px-4 sm:text-sm">
            Read
          </span>
        </div>
      </Link>
    </article>
  );
}

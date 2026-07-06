import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User } from "lucide-react";
import type { BlogPostSummary } from "@/types/wordpress";
import { formatBlogDate, getBlogCategoryPath, getBlogPostPath } from "@/lib/blogs-routes";
import { formatReadingTime } from "@/utils/readingTime";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  post: BlogPostSummary;
  className?: string;
  /** Eager-load the first row of listing cards for faster LCP. */
  priority?: boolean;
}

export function BlogCard({ post, className, priority = false }: BlogCardProps) {
  const primaryCategory = post.categories[0];

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] card-shadow transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6A3D]/35 hover:shadow-lg",
        className
      )}
    >
      <Link href={getBlogPostPath(post.slug)} className="relative block aspect-[16/10] overflow-hidden bg-[var(--bg)]">
        {post.featuredMedia?.url ? (
          <Image
            src={post.featuredMedia.url}
            alt={post.featuredMedia.alt || post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0B2545] to-[#1a4080]">
            <span className="font-heading text-lg font-bold text-white/30">Blog</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {primaryCategory && (
          <Link
            href={getBlogCategoryPath(primaryCategory.slug)}
            className="mb-3 inline-flex w-fit rounded-full bg-[#0B2545]/10 px-2.5 py-1 text-xs font-semibold text-[#0B2545] transition-colors hover:bg-[#FF6A3D]/10 hover:text-[#FF6A3D]"
          >
            {primaryCategory.name}
          </Link>
        )}
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatBlogDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatReadingTime(post.readingMinutes)}
          </span>
          {post.author && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author.name}
            </span>
          )}
        </div>

        <h2 className="font-heading text-lg font-bold leading-snug text-[var(--text)]">
          <Link href={getBlogPostPath(post.slug)} className="hover:text-[#FF6A3D] transition-colors">
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">
            {post.excerpt}
          </p>
        )}

        <Link
          href={getBlogPostPath(post.slug)}
          className="mt-4 inline-flex items-center text-sm font-semibold text-[#FF6A3D] hover:underline"
        >
          Read more
        </Link>
      </div>
    </article>
  );
}

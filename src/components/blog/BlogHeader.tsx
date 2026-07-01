import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";
import type { BlogPost } from "@/types/wordpress";
import { formatBlogDate, getBlogCategoryPath } from "@/lib/blogs-routes";
import { formatReadingTime } from "@/utils/readingTime";

interface BlogHeaderProps {
  post: BlogPost;
}

export function BlogHeader({ post }: BlogHeaderProps) {
  return (
    <header className="mb-8">
      {post.categories.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {post.categories.map((category) => (
            <Link
              key={category.id}
              href={getBlogCategoryPath(category.slug)}
              className="rounded-full bg-[#FF6A3D]/10 px-3 py-1 text-xs font-semibold text-[#FF6A3D] hover:bg-[#FF6A3D]/15 transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}

      <h1 className="font-heading text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">
        {post.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
        {post.author && (
          <span className="inline-flex items-center gap-2">
            <User className="h-4 w-4 text-[#FF6A3D]" />
            {post.author.name}
          </span>
        )}
        <span className="inline-flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#FF6A3D]" />
          {formatBlogDate(post.publishedAt)}
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#FF6A3D]" />
          {formatReadingTime(post.readingMinutes)}
        </span>
      </div>
    </header>
  );
}

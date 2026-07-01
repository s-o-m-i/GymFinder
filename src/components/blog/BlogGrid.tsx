import { BookOpen } from "lucide-react";
import type { BlogPostSummary } from "@/types/wordpress";
import { BlogCard } from "@/components/blog/BlogCard";

interface BlogGridProps {
  posts: BlogPostSummary[];
}

export function BlogGrid({ posts }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2545]/10">
          <BookOpen className="h-7 w-7 text-[#0B2545]" />
        </div>
        <h2 className="font-heading text-lg font-bold text-[var(--text)]">No articles yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--text-muted)]">
          New fitness tips, training guides, and nutrition articles will appear here soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post, index) => (
        <BlogCard key={post.id} post={post} priority={index < 3} />
      ))}
    </div>
  );
}

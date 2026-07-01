import Link from "next/link";
import type { BlogPostSummary } from "@/types/wordpress";
import { BlogCard } from "@/components/blog/BlogCard";
import { getBlogCategoryPath } from "@/lib/blogs-routes";

interface BlogRelatedPostsProps {
  posts: BlogPostSummary[];
  categoryName?: string;
  categorySlug?: string;
}

export function BlogRelatedPosts({ posts, categoryName, categorySlug }: BlogRelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-[var(--text)]">Related posts</h2>
          {categoryName && categorySlug && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              More from{" "}
              <Link
                href={getBlogCategoryPath(categorySlug)}
                className="font-semibold text-[#FF6A3D] hover:underline"
              >
                {categoryName}
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

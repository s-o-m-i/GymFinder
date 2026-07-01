import Link from "next/link";
import type { BlogCategory } from "@/types/wordpress";
import { BlogCategories } from "@/components/blog/BlogCategories";
import { getBlogCategoriesPath } from "@/lib/blogs-routes";

interface BlogSidebarProps {
  categories: BlogCategory[];
  activeCategorySlug?: string;
}

export function BlogSidebar({ categories, activeCategorySlug }: BlogSidebarProps) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Categories
          </h2>
          <Link
            href={getBlogCategoriesPath()}
            className="text-xs font-semibold text-[#FF6A3D] hover:underline shrink-0"
          >
            View all
          </Link>
        </div>
        <BlogCategories categories={categories} activeSlug={activeCategorySlug} />
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="mb-2 font-heading text-sm font-semibold text-[var(--text)]">Newsletter</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Placeholder — subscribe form coming soon.
        </p>
      </div>
    </aside>
  );
}

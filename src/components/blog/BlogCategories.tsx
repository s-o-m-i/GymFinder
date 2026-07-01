import Link from "next/link";
import type { BlogCategory } from "@/types/wordpress";
import { getBlogBasePath, getBlogCategoryPath } from "@/lib/blogs-routes";
import { cn } from "@/lib/utils";

interface BlogCategoriesProps {
  categories: BlogCategory[];
  activeSlug?: string;
  className?: string;
}

export function BlogCategories({ categories, activeSlug, className }: BlogCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Link
        href={getBlogBasePath()}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
          !activeSlug
            ? "border-[#FF6A3D] bg-[#FF6A3D]/10 text-[#FF6A3D]"
            : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[#FF6A3D]/30 hover:text-[var(--text)]"
        )}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={getBlogCategoryPath(category.slug)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            activeSlug === category.slug
              ? "border-[#FF6A3D] bg-[#FF6A3D]/10 text-[#FF6A3D]"
              : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[#FF6A3D]/30 hover:text-[var(--text)]"
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}

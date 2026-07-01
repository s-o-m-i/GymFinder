import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FolderOpen } from "lucide-react";
import type { BlogCategory } from "@/types/wordpress";
import { getBlogCategoryImage } from "@/lib/blog-category-images";
import { getBlogCategoryPath } from "@/lib/blogs-routes";
import { cn } from "@/lib/utils";

interface BlogCategoriesGridProps {
  categories: BlogCategory[];
  className?: string;
}

export function BlogCategoriesGrid({ categories, className }: BlogCategoriesGridProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2545]/10">
          <FolderOpen className="h-7 w-7 text-[#0B2545]" />
        </div>
        <h2 className="font-heading text-lg font-bold text-[var(--text)]">No categories yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--text-muted)]">
          Categories will appear here once they are added in WordPress.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {categories.map((category, index) => {
        const imageSrc = getBlogCategoryImage(category.slug);

        return (
          <Link
            key={category.id}
            href={getBlogCategoryPath(category.slug)}
            className="group relative block aspect-4/5 min-h-[260px] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0B2545] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FF6A3D]/40 hover:shadow-xl"
          >
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index < 3}
              loading={index < 3 ? undefined : "lazy"}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2545]/95 via-[#0B2545]/55 to-[#0B2545]/20 transition-opacity duration-300 group-hover:from-[#0B2545]/90 group-hover:via-[#0B2545]/45" />

            <div className="absolute inset-0 flex flex-col items-center justify-end p-5 text-center">
              <h2 className="font-heading text-lg font-bold text-white drop-shadow-sm">
                {category.name}
              </h2>

              {category.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/85">
                  {category.description}
                </p>
              ) : (
                <p className="mt-2 text-sm text-white/80">
                  Articles about {category.name.toLowerCase()}
                </p>
              )}

              <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#FF6A3D] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                {category.count === 1 ? "1 article" : `${category.count} articles`}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

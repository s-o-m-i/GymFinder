import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogPaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  className?: string;
}

function buildPageHref(basePath: string, page: number): string {
  if (page <= 1) return basePath;
  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}page=${page}`;
}

function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

export function BlogPagination({ page, totalPages, basePath, className }: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav
      aria-label="Blog pagination"
      className={cn("mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between", className)}
    >
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildPageHref(basePath, page - 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold hover:border-[#FF6A3D]/30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm text-[var(--text-muted)] opacity-50">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </span>
        )}

        {page < totalPages ? (
          <Link
            href={buildPageHref(basePath, page + 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold hover:border-[#FF6A3D]/30 transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm text-[var(--text-muted)] opacity-50">
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {visiblePages.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sm text-[var(--text-muted)]">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={buildPageHref(basePath, item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors",
                item === page
                  ? "bg-[#FF6A3D] text-white"
                  : "border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[#FF6A3D]/30 hover:text-[var(--text)]"
              )}
            >
              {item}
            </Link>
          )
        )}
      </div>

      <p className="text-sm text-[var(--text-muted)]">
        Page {page} of {totalPages}
      </p>
    </nav>
  );
}

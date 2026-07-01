import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogBreadcrumbSchema, type BlogBreadcrumbItem } from "@/lib/blogs-routes";
import { cn } from "@/lib/utils";

interface BlogBreadcrumbsProps {
  items: BlogBreadcrumbItem[];
  className?: string;
}

export function BlogBreadcrumbs({ items, className }: BlogBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <>
      <JsonLd data={buildBlogBreadcrumbSchema(items)} />
      <nav
        aria-label="Breadcrumb"
        className={cn(
          "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[var(--text-muted)]",
          className
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 && <span aria-hidden>/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-[var(--text)]">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast && "font-medium text-[var(--text)] line-clamp-1")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}

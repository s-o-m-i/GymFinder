import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbSchema,
  type TrustBreadcrumbItem,
} from "@/lib/trust-pages/breadcrumbs";
import { cn } from "@/lib/utils";

interface PageBreadcrumbsProps {
  items: TrustBreadcrumbItem[];
  className?: string;
}

export function PageBreadcrumbs({ items, className }: PageBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema(items)} />
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
              {index > 0 && (
                <span aria-hidden className="text-[var(--border)]">
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-[var(--text)]">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast && "font-medium text-[var(--text)]")}
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

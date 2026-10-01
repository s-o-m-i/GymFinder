import Link from "next/link";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

function normalizeLabel(label: string) {
  return label.trim().toLowerCase();
}

function dedupeBreadcrumbItems(items: BreadcrumbItem[]): BreadcrumbItem[] {
  const result: BreadcrumbItem[] = [];

  for (const item of items) {
    const prev = result[result.length - 1];
    if (prev && normalizeLabel(prev.label) === normalizeLabel(item.label)) {
      result[result.length - 1] = item;
      continue;
    }
    result.push(item);
  }

  return result;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const crumbs = dedupeBreadcrumbItems(items);
  if (crumbs.length === 0) return null;

  const collapseMiddle = crumbs.length > 3;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center text-xs text-[var(--text-muted)]">
        {crumbs.map((item, index) => {
          const isLast = index === crumbs.length - 1;
          const isFirst = index === 0;
          const isMiddle = collapseMiddle && !isFirst && !isLast;

          return (
            <li
              key={`${item.href ?? item.label}-${index}`}
              className={cn(
                "flex min-w-0 items-center",
                isLast && "min-w-0 flex-1 overflow-hidden",
                isMiddle && "hidden sm:flex"
              )}
            >
              {index > 0 && (
                <span
                  className="mx-1.5 shrink-0 select-none text-[var(--text-muted)]/55"
                  aria-hidden
                >
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "whitespace-nowrap transition-colors hover:text-[var(--text)]",
                    isFirst ? "shrink-0" : "max-w-[9rem] truncate sm:max-w-[14rem]"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  title={item.label}
                  className={cn("min-w-0 truncate", isLast && "font-medium text-[var(--text)]")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {isFirst && collapseMiddle && (
                <span
                  className="mx-1.5 inline select-none text-[var(--text-muted)]/55 sm:hidden"
                  aria-hidden
                >
                  / …
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

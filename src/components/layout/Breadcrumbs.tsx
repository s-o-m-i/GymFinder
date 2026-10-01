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

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "min-w-0 max-w-full overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      <ol className="flex w-max items-center text-xs text-[var(--text-muted)]">
        {crumbs.map((item, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li
              key={`${item.href ?? item.label}-${index}`}
              className="flex shrink-0 items-center"
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
                  className="shrink-0 whitespace-nowrap transition-colors hover:text-[var(--text)]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "shrink-0 whitespace-nowrap",
                    isLast && "font-medium text-[var(--text)]"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

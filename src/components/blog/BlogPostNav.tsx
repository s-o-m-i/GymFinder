import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BlogPostNavigation } from "@/types/wordpress";
import { getBlogPostPath } from "@/lib/blogs-routes";

interface BlogPostNavProps {
  navigation: BlogPostNavigation;
}

export function BlogPostNav({ navigation }: BlogPostNavProps) {
  const { previous, next } = navigation;

  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Post navigation"
      className="mt-8 grid gap-4 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          href={getBlogPostPath(previous.slug)}
          className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:border-[#FF6A3D]/30"
        >
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </span>
          <p className="mt-2 font-heading text-sm font-bold text-[var(--text)] group-hover:text-[#FF6A3D] transition-colors line-clamp-2">
            {previous.title}
          </p>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={getBlogPostPath(next.slug)}
          className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-right transition-colors hover:border-[#FF6A3D]/30 sm:col-start-2"
        >
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
          <p className="mt-2 font-heading text-sm font-bold text-[var(--text)] group-hover:text-[#FF6A3D] transition-colors line-clamp-2">
            {next.title}
          </p>
        </Link>
      ) : null}
    </nav>
  );
}

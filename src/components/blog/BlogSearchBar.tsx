"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { BLOG_SEARCH_PARAM } from "@/lib/blogs-routes";
import { cn } from "@/lib/utils";

interface BlogSearchBarProps {
  basePath: string;
  placeholder?: string;
  className?: string;
}

function BlogSearchBarInner({
  basePath,
  placeholder = "Search articles…",
  className,
}: BlogSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get(BLOG_SEARCH_PARAM) ?? "";
  const [searchInput, setSearchInput] = useState(urlSearch);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (searchInput === urlSearch) return;

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = searchInput.trim();

      if (trimmed) params.set(BLOG_SEARCH_PARAM, trimmed);
      else params.delete(BLOG_SEARCH_PARAM);

      params.delete("page");

      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput, urlSearch, basePath, router, searchParams]);

  function clearSearch() {
    setSearchInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete(BLOG_SEARCH_PARAM);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
      <input
        type="search"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder={placeholder}
        aria-label="Search blog articles"
        className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] pl-11 pr-11 text-sm text-[var(--text)] shadow-sm transition-colors placeholder:text-[var(--text-muted)] focus:border-[#FF6A3D]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20"
      />
      {searchInput && (
        <button
          type="button"
          onClick={clearSearch}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--text)]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function BlogSearchBarFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-12 w-full animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]",
        className
      )}
      aria-hidden
    />
  );
}

export function BlogSearchBar(props: BlogSearchBarProps) {
  return (
    <Suspense fallback={<BlogSearchBarFallback className={props.className} />}>
      <BlogSearchBarInner {...props} />
    </Suspense>
  );
}

import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogHero } from "@/components/blog/BlogHero";
import { BlogCategoriesGrid } from "@/components/blog/BlogCategoriesGrid";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogUnavailable } from "@/components/blog/BlogUnavailable";
import { BlogBreadcrumbs } from "@/components/blog/BlogBreadcrumbs";
import { BlogSearchBar } from "@/components/blog/BlogSearchBar";
import { BlogPagination } from "@/components/blog/BlogPagination";
import {
  blogCategoriesBreadcrumbs,
  getBlogCategoriesPath,
  parseBlogSearchQuery,
} from "@/lib/blogs-routes";
import type { BlogCategory, PaginatedBlogPosts } from "@/types/wordpress";
import {
  getCategories,
  searchPosts,
  WordPressUnavailableError,
} from "@/services/wordpress.service";

interface BlogCategoriesPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export async function BlogCategoriesPage({ searchParams = {} }: BlogCategoriesPageProps) {
  const pageParam = searchParams.page;
  const page =
    typeof pageParam === "string" && !Number.isNaN(Number(pageParam))
      ? Math.max(1, Number(pageParam))
      : 1;
  const searchQuery = parseBlogSearchQuery(searchParams);
  const basePath = getBlogCategoriesPath();

  let categories: BlogCategory[] = [];
  let searchResults: PaginatedBlogPosts | null = null;
  let unavailable = false;

  try {
    if (searchQuery) {
      [categories, searchResults] = await Promise.all([
        getCategories(),
        searchPosts(searchQuery, { page }),
      ]);
    } else {
      categories = await getCategories();
    }
  } catch (error) {
    if (error instanceof WordPressUnavailableError) {
      unavailable = true;
    } else {
      throw error;
    }
  }

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <BlogBreadcrumbs items={blogCategoriesBreadcrumbs()} className="mb-4" />
          <div className="mx-auto max-w-2xl text-center">
            <BlogHero
              centered
              title="Blog Categories"
              description="Browse articles by topic — fitness tips, nutrition, muscle building, and more."
            />
          </div>

          <BlogSearchBar
            basePath={basePath}
            placeholder="Search all articles…"
            className="mx-auto mb-8 max-w-xl"
          />

          {unavailable ? (
            <div className="mx-auto max-w-xl">
              <BlogUnavailable />
            </div>
          ) : searchQuery ? (
            <div className="mx-auto w-full max-w-5xl">
              {searchResults && (
                <p className="mb-6 text-center text-sm text-[var(--text-muted)]">
                  {searchResults.total === 1
                    ? `1 result for "${searchQuery}"`
                    : `${searchResults.total} results for "${searchQuery}"`}
                </p>
              )}
              <BlogGrid
                posts={searchResults?.posts ?? []}
                emptyTitle="No articles found"
                emptyDescription={`We couldn't find any articles matching "${searchQuery}". Try different keywords.`}
              />
              {searchResults && (
                <BlogPagination
                  page={searchResults.page}
                  totalPages={searchResults.totalPages}
                  basePath={basePath}
                  searchQuery={searchQuery}
                />
              )}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-5xl">
              <BlogCategoriesGrid categories={sortedCategories} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogHero } from "@/components/blog/BlogHero";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { BlogUnavailable } from "@/components/blog/BlogUnavailable";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { BlogBreadcrumbs } from "@/components/blog/BlogBreadcrumbs";
import {
  blogCategoryBreadcrumbs,
  blogListingBreadcrumbs,
  getBlogBasePath,
} from "@/lib/blogs-routes";
import type { BlogCategory, PaginatedBlogPosts } from "@/types/wordpress";
import {
  getCategories,
  getPosts,
  getPostsByCategory,
  WordPressUnavailableError,
} from "@/services/wordpress.service";

interface BlogListingPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
  categorySlug?: string;
  heroTitle?: string;
  heroDescription?: string;
}

export async function BlogListingPage({
  searchParams = {},
  categorySlug,
  heroTitle,
  heroDescription,
}: BlogListingPageProps) {
  const pageParam = searchParams.page;
  const page =
    typeof pageParam === "string" && !Number.isNaN(Number(pageParam))
      ? Math.max(1, Number(pageParam))
      : 1;

  let categories: BlogCategory[] = [];
  let postsResult: PaginatedBlogPosts | null = null;
  let unavailable = false;

  try {
    const categoriesPromise = getCategories();

    if (categorySlug) {
      const [cats, categoryData] = await Promise.all([
        categoriesPromise,
        getPostsByCategory(categorySlug, { page }),
      ]);
      categories = cats;
      postsResult = categoryData?.result ?? {
        posts: [],
        total: 0,
        page,
        perPage: 9,
        totalPages: 0,
      };
    } else {
      [categories, postsResult] = await Promise.all([categoriesPromise, getPosts({ page })]);
    }
  } catch (error) {
    if (error instanceof WordPressUnavailableError) {
      unavailable = true;
    } else {
      throw error;
    }
  }

  const basePath = categorySlug
    ? `${getBlogBasePath()}/category/${categorySlug}`
    : getBlogBasePath();

  const breadcrumbItems =
    categorySlug && heroTitle
      ? blogCategoryBreadcrumbs({ name: heroTitle, slug: categorySlug })
      : blogListingBreadcrumbs();

  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <BlogBreadcrumbs items={breadcrumbItems} className="mb-4" />
          <BlogHero title={heroTitle} description={heroDescription} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              {unavailable ? (
                <BlogUnavailable />
              ) : (
                <>
                  <BlogGrid posts={postsResult?.posts ?? []} />
                  {postsResult && (
                    <BlogPagination
                      page={postsResult.page}
                      totalPages={postsResult.totalPages}
                      basePath={basePath}
                    />
                  )}
                </>
              )}
            </div>

            {!unavailable && (
              <BlogSidebar categories={categories} activeCategorySlug={categorySlug} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

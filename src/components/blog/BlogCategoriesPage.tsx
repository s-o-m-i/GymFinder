import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogHero } from "@/components/blog/BlogHero";
import { BlogCategoriesGrid } from "@/components/blog/BlogCategoriesGrid";
import { BlogUnavailable } from "@/components/blog/BlogUnavailable";
import { BlogBreadcrumbs } from "@/components/blog/BlogBreadcrumbs";
import { blogCategoriesBreadcrumbs } from "@/lib/blogs-routes";
import type { BlogCategory } from "@/types/wordpress";
import { getCategories, WordPressUnavailableError } from "@/services/wordpress.service";

export async function BlogCategoriesPage() {
  let categories: BlogCategory[] = [];
  let unavailable = false;

  try {
    categories = await getCategories();
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
      <Navbar />
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

          <div className="mx-auto w-full max-w-5xl">
            {unavailable ? (
              <div className="mx-auto max-w-xl">
                <BlogUnavailable />
              </div>
            ) : (
              <BlogCategoriesGrid categories={sortedCategories} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

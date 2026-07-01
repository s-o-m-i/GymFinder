import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListingPage } from "@/components/blog/BlogListingPage";
import { generateBlogCategoryMetadata } from "@/lib/blogs-routes";
import { getCategoryBySlug } from "@/services/wordpress.service";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };
  return generateBlogCategoryMetadata(category);
}

export default async function BlogCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  return (
    <BlogListingPage
      searchParams={query}
      categorySlug={slug}
      heroTitle={category.name}
      heroDescription={
        category.description ||
        `Articles and guides about ${category.name.toLowerCase()} from the FitnessAdda PK blog.`
      }
    />
  );
}

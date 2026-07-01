import type { Metadata } from "next";
import { BlogCategoriesPage } from "@/components/blog/BlogCategoriesPage";
import { generateBlogCategoriesListingMetadata } from "@/lib/blogs-routes";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  return generateBlogCategoriesListingMetadata();
}

export default async function BlogsCategoriesRoute({ searchParams }: PageProps) {
  const params = await searchParams;
  return <BlogCategoriesPage searchParams={params} />;
}

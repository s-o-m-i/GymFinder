import type { Metadata } from "next";
import { BlogCategoriesPage } from "@/components/blog/BlogCategoriesPage";
import { generateBlogCategoriesListingMetadata } from "@/lib/blogs-routes";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateBlogCategoriesListingMetadata();
}

export default function BlogsCategoriesRoute() {
  return <BlogCategoriesPage />;
}

import type { Metadata } from "next";
import { BlogListingPage } from "@/components/blog/BlogListingPage";
import { generateBlogListingMetadata } from "@/lib/blogs-routes";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  return generateBlogListingMetadata();
}

export default async function BlogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <BlogListingPage searchParams={params} />;
}

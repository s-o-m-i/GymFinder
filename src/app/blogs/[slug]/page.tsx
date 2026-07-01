import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { BlogShareButtons } from "@/components/blog/BlogShareButtons";
import { BlogRelatedPosts } from "@/components/blog/BlogRelatedPosts";
import { BlogReadingProgress } from "@/components/blog/BlogReadingProgress";
import { BlogBreadcrumbs } from "@/components/blog/BlogBreadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  blogPostBreadcrumbs,
  buildBlogPostSchema,
  generateBlogPostMetadata,
  getBlogPostUrl,
} from "@/lib/blogs-routes";
import {
  getAdjacentPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/services/wordpress.service";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article Not Found" };
  return generateBlogPostMetadata(post);
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [navigation, relatedPosts] = await Promise.all([
    getAdjacentPosts(post),
    getRelatedPosts(post),
  ]);

  const shareUrl = getBlogPostUrl(post.slug);
  const primaryCategory = post.categories[0];

  return (
    <>
      <JsonLd data={buildBlogPostSchema(post)} />
      <BlogReadingProgress />
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <BlogBreadcrumbs
            items={blogPostBreadcrumbs(post, primaryCategory)}
            className="mb-6"
          />

          {post.featuredMedia?.url && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
              <Image
                src={post.featuredMedia.url}
                alt={post.featuredMedia.alt || post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
          )}

          <article
            id="blog-article"
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8"
          >
            <BlogHeader post={post} />
            <BlogContent html={post.content} />

            {post.tags.length > 0 && (
              <div className="mt-8 border-t border-[var(--border)] pt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          <BlogPostNav navigation={navigation} />

          <div className="mt-4">
            <BlogShareButtons url={shareUrl} title={post.title} />
          </div>

          <BlogRelatedPosts
            posts={relatedPosts}
            categoryName={primaryCategory?.name}
            categorySlug={primaryCategory?.slug}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

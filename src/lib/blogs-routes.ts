import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import type { BlogCategory, BlogPost, BlogPostSummary } from "@/types/wordpress";

const BLOG_BASE_PATH = "/blogs";

export interface BlogBreadcrumbItem {
  label: string;
  href?: string;
}

const HIDDEN_BLOG_CATEGORY_SLUGS = new Set(["uncategorized"]);

export function isVisibleBlogCategory(category: { slug: string }): boolean {
  return !HIDDEN_BLOG_CATEGORY_SLUGS.has(category.slug.toLowerCase());
}

export function filterVisibleBlogCategories<T extends { slug: string }>(categories: T[]): T[] {
  return categories.filter(isVisibleBlogCategory);
}

export function getBlogBasePath(): string {
  return BLOG_BASE_PATH;
}

export function getBlogPostPath(slug: string): string {
  return `${BLOG_BASE_PATH}/${slug}`;
}

export function getBlogPostUrl(slug: string): string {
  return buildCanonical(getBlogPostPath(slug));
}

export function getBlogCategoryPath(slug: string): string {
  return `${BLOG_BASE_PATH}/category/${slug}`;
}

export function getBlogCategoriesPath(): string {
  return `${BLOG_BASE_PATH}/categories`;
}

export const BLOG_SEARCH_PARAM = "search";

export function parseBlogSearchQuery(
  searchParams: Record<string, string | string[] | undefined>
): string {
  const raw = searchParams[BLOG_SEARCH_PARAM];
  if (typeof raw === "string") return raw.trim();
  return "";
}

export function buildBlogQueryPath(
  basePath: string,
  options?: { page?: number; search?: string }
): string {
  const params = new URLSearchParams();
  const search = options?.search?.trim();

  if (search) params.set(BLOG_SEARCH_PARAM, search);
  if (options?.page && options.page > 1) params.set("page", String(options.page));

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function blogListingBreadcrumbs(): BlogBreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Blog", href: getBlogBasePath() },
  ];
}

export function blogCategoriesBreadcrumbs(): BlogBreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Blog", href: getBlogBasePath() },
    { label: "Categories", href: getBlogCategoriesPath() },
  ];
}

export function blogCategoryBreadcrumbs(category: {
  name: string;
  slug: string;
}): BlogBreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Blog", href: getBlogBasePath() },
    { label: category.name, href: getBlogCategoryPath(category.slug) },
  ];
}

export function blogPostBreadcrumbs(
  post: { title: string; slug: string },
  primaryCategory?: { name: string; slug: string }
): BlogBreadcrumbItem[] {
  const items: BlogBreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Blog", href: getBlogBasePath() },
  ];

  if (primaryCategory) {
    items.push({
      label: primaryCategory.name,
      href: getBlogCategoryPath(primaryCategory.slug),
    });
  }

  items.push({ label: post.title, href: getBlogPostPath(post.slug) });
  return items;
}

export function buildBlogBreadcrumbSchema(items: BlogBreadcrumbItem[]) {
  const baseUrl = getAppBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  };
}

function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function buildCanonical(path: string): string {
  return `${getAppBaseUrl()}${path}`;
}

export function generateBlogListingMetadata(): Metadata {
  const title = `Fitness Blog`;
  const description =
    "Expert fitness tips, nutrition advice, training guides, and wellness insights from FitnessAdda PK.";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: buildCanonical(getBlogBasePath()),
      type: "website",
    },
    alternates: {
      canonical: buildCanonical(getBlogBasePath()),
    },
  };
}

export function generateBlogCategoriesListingMetadata(): Metadata {
  const title = "Blog Categories";
  const description =
    "Browse fitness, nutrition, training, and wellness articles by topic on the FitnessAdda PK blog.";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: buildCanonical(getBlogCategoriesPath()),
      type: "website",
    },
    alternates: {
      canonical: buildCanonical(getBlogCategoriesPath()),
    },
  };
}

export function generateBlogPostMetadata(post: BlogPost): Metadata {
  const description =
    post.excerpt ||
    post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 155);

  const canonical = buildCanonical(getBlogPostPath(post.slug));

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      url: canonical,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
      authors: post.author ? [post.author.name] : undefined,
      images: post.featuredMedia?.url
        ? [{ url: post.featuredMedia.url, alt: post.featuredMedia.alt || post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.featuredMedia?.url ? [post.featuredMedia.url] : undefined,
    },
    alternates: {
      canonical,
    },
  };
}

export function generateBlogCategoryMetadata(category: BlogCategory): Metadata {
  const title = `${category.name} Articles`;
  const description =
    category.description ||
    `Browse ${category.name.toLowerCase()} articles, tips, and guides on the ${SITE_NAME} blog.`;

  const canonical = buildCanonical(getBlogCategoryPath(category.slug));

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      type: "website",
    },
    alternates: {
      canonical,
    },
  };
}

export function buildBlogPostSchema(post: BlogPost) {
  const baseUrl = getAppBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.modifiedAt,
    image: post.featuredMedia?.url,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: baseUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}${getBlogPostPath(post.slug)}`,
    },
  };
}

export function formatBlogDate(date: string): string {
  return new Date(date).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type { BlogPostSummary };

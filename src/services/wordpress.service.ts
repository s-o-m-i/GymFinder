import "server-only";

import {
  categoriesEndpoint,
  categoryBySlugEndpoint,
  postBySlugEndpoint,
  postsEndpoint,
} from "@/lib/wordpress/endpoints";
import {
  WordPressApiError,
  WordPressUnavailableError,
  wordpressFetch,
  wordpressFetchList,
} from "@/lib/wordpress/client";
import { sanitizeBlogHtml } from "@/lib/sanitize-html";
import { stripAndDecodeHtml } from "@/lib/decode-html-entities";
import { filterVisibleBlogCategories, isVisibleBlogCategory } from "@/lib/blogs-routes";
import { estimateReadingTime } from "@/utils/readingTime";
import type {
  BlogAuthor,
  BlogCategory,
  BlogFeaturedMedia,
  BlogPost,
  BlogPostNavigation,
  BlogPostSummary,
  BlogPostsQuery,
  BlogTag,
  PaginatedBlogPosts,
  WPCategory,
  WPPost,
  WPTerm,
} from "@/types/wordpress";

export const BLOG_POSTS_PER_PAGE = 9;

export { WordPressApiError, WordPressUnavailableError };

function mapAuthor(post: WPPost): BlogAuthor | null {
  const author = post._embedded?.author?.[0];
  if (!author) return null;

  return {
    id: author.id,
    name: stripAndDecodeHtml(author.name),
    slug: author.slug,
    avatarUrl: author.avatar_urls?.["96"] ?? author.avatar_urls?.["48"] ?? null,
  };
}

function mapFeaturedMedia(post: WPPost): BlogFeaturedMedia | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media?.source_url) return null;

  return {
    id: media.id,
    url: media.source_url,
    alt: media.alt_text || "",
    width: media.media_details?.width ?? null,
    height: media.media_details?.height ?? null,
  };
}

function mapEmbeddedTerms(post: WPPost): { categories: BlogCategory[]; tags: BlogTag[] } {
  const termGroups = post._embedded?.["wp:term"] ?? [];
  const flatTerms = termGroups.flat();

  const categories: BlogCategory[] = flatTerms
    .filter((term): term is WPTerm => term.taxonomy === "category")
    .map((term) => ({
      id: term.id,
      name: stripAndDecodeHtml(term.name),
      slug: term.slug,
      description: term.description ?? "",
      count: term.count ?? 0,
    }))
    .filter(isVisibleBlogCategory);

  const tags: BlogTag[] = flatTerms
    .filter((term): term is WPTerm => term.taxonomy === "post_tag")
    .map((term) => ({
      id: term.id,
      name: stripAndDecodeHtml(term.name),
      slug: term.slug,
    }));

  return { categories, tags };
}

function mapWPPostToSummary(post: WPPost): BlogPostSummary {
  const { categories } = mapEmbeddedTerms(post);
  const plainContent = stripAndDecodeHtml(post.content.rendered);

  return {
    id: post.id,
    slug: post.slug,
    title: stripAndDecodeHtml(post.title.rendered),
    excerpt: stripAndDecodeHtml(post.excerpt.rendered),
    publishedAt: post.date,
    modifiedAt: post.modified,
    readingMinutes: estimateReadingTime(plainContent || post.excerpt.rendered),
    author: mapAuthor(post),
    categories,
    featuredMedia: mapFeaturedMedia(post),
    link: post.link,
  };
}

function mapWPPostToBlogPost(post: WPPost): BlogPost {
  const { categories, tags } = mapEmbeddedTerms(post);
  const sanitizedContent = sanitizeBlogHtml(post.content.rendered);

  return {
    id: post.id,
    slug: post.slug,
    title: stripAndDecodeHtml(post.title.rendered),
    excerpt: stripAndDecodeHtml(post.excerpt.rendered),
    content: sanitizedContent,
    publishedAt: post.date,
    modifiedAt: post.modified,
    readingMinutes: estimateReadingTime(sanitizedContent),
    author: mapAuthor(post),
    categories,
    tags,
    featuredMedia: mapFeaturedMedia(post),
    link: post.link,
  };
}

function mapWPCategory(category: WPCategory): BlogCategory {
  return {
    id: category.id,
    name: stripAndDecodeHtml(category.name),
    slug: category.slug,
    description: category.description ?? "",
    count: category.count ?? 0,
  };
}

function buildPaginatedPosts(
  posts: WPPost[],
  pagination: { total: number; totalPages: number },
  page: number,
  perPage: number
): PaginatedBlogPosts {
  return {
    posts: posts.map(mapWPPostToSummary),
    total: pagination.total,
    page,
    perPage,
    totalPages: pagination.totalPages,
  };
}

function buildPostsEndpointParams(query: BlogPostsQuery): Record<string, string | number | undefined> {
  const params: Record<string, string | number | undefined> = {
    page: query.page,
    per_page: query.perPage,
    categories: query.categoryId,
    search: query.search,
    before: query.before,
    after: query.after,
    order: query.order,
    orderby: query.orderby,
  };

  if (query.excludeIds?.length) {
    params.exclude = query.excludeIds.join(",");
  }

  return params;
}

export async function getPosts(
  query: BlogPostsQuery = {}
): Promise<PaginatedBlogPosts> {
  const page = query.page ?? 1;
  const perPage = query.perPage ?? BLOG_POSTS_PER_PAGE;

  const { data, pagination } = await wordpressFetchList<WPPost>(
    postsEndpoint(buildPostsEndpointParams({ ...query, page, perPage }))
  );

  return buildPaginatedPosts(data, pagination, page, perPage);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await wordpressFetch<WPPost[]>(postBySlugEndpoint(slug));
  const post = posts[0];
  if (!post) return null;
  return mapWPPostToBlogPost(post);
}

export async function getCategories(): Promise<BlogCategory[]> {
  const categories = await wordpressFetch<WPCategory[]>(categoriesEndpoint());
  return filterVisibleBlogCategories(categories.map(mapWPCategory));
}

export async function getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  if (!isVisibleBlogCategory({ slug })) return null;

  const categories = await wordpressFetch<WPCategory[]>(categoryBySlugEndpoint(slug));
  const category = categories[0];
  if (!category) return null;
  return mapWPCategory(category);
}

export async function getPostsByCategory(
  categorySlug: string,
  query: Omit<BlogPostsQuery, "categoryId"> = {}
): Promise<{ category: BlogCategory; result: PaginatedBlogPosts } | null> {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;

  const result = await getPosts({
    ...query,
    categoryId: category.id,
  });

  return { category, result };
}

export async function searchPosts(
  searchQuery: string,
  query: Omit<BlogPostsQuery, "search"> = {}
): Promise<PaginatedBlogPosts> {
  return getPosts({
    ...query,
    search: searchQuery,
  });
}

export async function getAdjacentPosts(post: BlogPost): Promise<BlogPostNavigation> {
  const [olderPosts, newerPosts] = await Promise.all([
    wordpressFetchList<WPPost>(
      postsEndpoint(
        buildPostsEndpointParams({
          perPage: 2,
          before: post.publishedAt,
          order: "desc",
          orderby: "date",
          excludeIds: [post.id],
        })
      )
    ),
    wordpressFetchList<WPPost>(
      postsEndpoint(
        buildPostsEndpointParams({
          perPage: 2,
          after: post.publishedAt,
          order: "asc",
          orderby: "date",
          excludeIds: [post.id],
        })
      )
    ),
  ]);

  const previousPost = olderPosts.data.find((item) => item.id !== post.id) ?? null;
  const nextPost = newerPosts.data.find((item) => item.id !== post.id) ?? null;

  return {
    previous: previousPost ? mapWPPostToSummary(previousPost) : null,
    next: nextPost ? mapWPPostToSummary(nextPost) : null,
  };
}

export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPostSummary[]> {
  const primaryCategoryId = post.categories[0]?.id;

  const { data } = await wordpressFetchList<WPPost>(
    postsEndpoint(
      buildPostsEndpointParams({
        perPage: limit + 1,
        categoryId: primaryCategoryId,
        excludeIds: [post.id],
        order: "desc",
        orderby: "date",
      })
    )
  );

  const related = data.filter((item) => item.id !== post.id).slice(0, limit);

  if (related.length >= limit || !primaryCategoryId) {
    return related.map(mapWPPostToSummary);
  }

  const remaining = limit - related.length;
  const existingIds = new Set([post.id, ...related.map((item) => item.id)]);

  const { data: fallbackPosts } = await wordpressFetchList<WPPost>(
    postsEndpoint(
      buildPostsEndpointParams({
        perPage: remaining + existingIds.size,
        excludeIds: [...existingIds],
        order: "desc",
        orderby: "date",
      })
    )
  );

  const merged = [
    ...related,
    ...fallbackPosts.filter((item) => !existingIds.has(item.id)).slice(0, remaining),
  ];

  return merged.map(mapWPPostToSummary);
}

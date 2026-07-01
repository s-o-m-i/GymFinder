/** WordPress REST API raw response shapes */

export type WPRenderedField = {
  rendered: string;
  protected?: boolean;
};

export type WPLink = {
  href: string;
  targetHints?: { allow: string[] };
  embeddable?: boolean;
};

export type WPFeaturedMedia = {
  id: number;
  slug: string;
  alt_text: string;
  media_type: string;
  mime_type: string;
  source_url: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<
      string,
      {
        source_url: string;
        width: number;
        height: number;
      }
    >;
  };
};

export type WPAuthor = {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatar_urls?: Record<string, string>;
  link?: string;
};

export type WPTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy: "category" | "post_tag" | string;
  description: string;
  count: number;
  link?: string;
};

export type WPPostEmbedded = {
  author?: WPAuthor[];
  "wp:featuredmedia"?: WPFeaturedMedia[];
  "wp:term"?: WPTerm[][];
};

export type WPPost = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: WPRenderedField;
  content: WPRenderedField;
  excerpt: WPRenderedField;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: WPPostEmbedded;
};

export type WPCategory = {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
};

export type WPTag = {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
};

/** Pagination headers returned by WordPress list endpoints */
export type WordPressPaginationHeaders = {
  total: number;
  totalPages: number;
};

export type WordPressListResponse<T> = {
  data: T[];
  pagination: WordPressPaginationHeaders;
};

/** Normalized domain models used by the Next.js app */

export type BlogFeaturedMedia = {
  id: number;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type BlogAuthor = {
  id: number;
  name: string;
  slug: string;
  avatarUrl: string | null;
};

export type BlogCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
};

export type BlogTag = {
  id: number;
  name: string;
  slug: string;
};

export type BlogPostSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  modifiedAt: string;
  readingMinutes: number;
  author: BlogAuthor | null;
  categories: BlogCategory[];
  featuredMedia: BlogFeaturedMedia | null;
  link: string;
};

export type BlogPost = BlogPostSummary & {
  content: string;
  tags: BlogTag[];
};

export type PaginatedBlogPosts = {
  posts: BlogPostSummary[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type BlogPostsQuery = {
  page?: number;
  perPage?: number;
  categoryId?: number;
  search?: string;
  excludeIds?: number[];
  before?: string;
  after?: string;
  order?: "asc" | "desc";
  orderby?: "date" | "title" | "id";
};

export type BlogPostNavigation = {
  previous: BlogPostSummary | null;
  next: BlogPostSummary | null;
};

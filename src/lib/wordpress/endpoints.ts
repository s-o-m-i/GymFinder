const WP_API_VERSION = "wp/v2";

export function getWordPressSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_WORDPRESS_URL?.trim();
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_WORDPRESS_URL is not configured. Add it to your environment variables."
    );
  }
  return url.replace(/\/+$/, "");
}

export function getWordPressApiBase(): string {
  return `${getWordPressSiteUrl()}/wp-json/${WP_API_VERSION}`;
}

export function postsEndpoint(params?: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  searchParams.set("_embed", "1");

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    }
  }

  return `${getWordPressApiBase()}/posts?${searchParams.toString()}`;
}

export function postBySlugEndpoint(slug: string): string {
  return postsEndpoint({ slug, per_page: 1 });
}

export function categoriesEndpoint(params?: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams({ per_page: "100" });

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    }
  }

  return `${getWordPressApiBase()}/categories?${searchParams.toString()}`;
}

export function categoryBySlugEndpoint(slug: string): string {
  const searchParams = new URLSearchParams({ slug, per_page: "1" });
  return `${getWordPressApiBase()}/categories?${searchParams.toString()}`;
}

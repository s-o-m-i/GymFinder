import type { WordPressListResponse, WordPressPaginationHeaders } from "@/types/wordpress";

export const WORDPRESS_REVALIDATE_SECONDS = 60;

export class WordPressApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly endpoint: string
  ) {
    super(message);
    this.name = "WordPressApiError";
  }
}

export class WordPressUnavailableError extends Error {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "WordPressUnavailableError";
  }
}

function parsePaginationHeaders(response: Response): WordPressPaginationHeaders {
  const total = Number(response.headers.get("X-WP-Total") ?? "0");
  const totalPages = Number(response.headers.get("X-WP-TotalPages") ?? "0");

  return {
    total: Number.isFinite(total) ? total : 0,
    totalPages: Number.isFinite(totalPages) ? totalPages : 0,
  };
}

export async function wordpressFetch<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new WordPressApiError(
        `WordPress API responded with ${response.status}`,
        response.status,
        endpoint
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof WordPressApiError) throw error;

    throw new WordPressUnavailableError(
      "Unable to reach the WordPress CMS. Please try again later.",
      endpoint,
      error
    );
  }
}

export async function wordpressFetchList<T>(
  endpoint: string
): Promise<WordPressListResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new WordPressApiError(
        `WordPress API responded with ${response.status}`,
        response.status,
        endpoint
      );
    }

    const data = (await response.json()) as T[];

    return {
      data,
      pagination: parsePaginationHeaders(response),
    };
  } catch (error) {
    if (error instanceof WordPressApiError) throw error;

    throw new WordPressUnavailableError(
      "Unable to reach the WordPress CMS. Please try again later.",
      endpoint,
      error
    );
  }
}

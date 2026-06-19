export function getSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getPublicListingPath(slug: string): string {
  return `/gyms/${slug}`;
}

export function getPublicListingUrl(slug: string): string {
  return `${getSiteOrigin()}${getPublicListingPath(slug)}`;
}

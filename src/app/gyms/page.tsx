import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { GymsListingPage } from "@/components/gym/GymsListingPage";
import { cityNameToSlug, typeValueToSlug } from "@/lib/gyms-routes";
import { gymTypeLabel } from "@/lib/utils";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const type   = params.type as string | undefined;
  const base   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const title = type
    ? `${gymTypeLabel(type)} Gyms in Rawalpindi & Islamabad`
    : "All Gyms & Fighting Clubs in Rawalpindi & Islamabad";

  return {
    title,
    description: SITE_DESCRIPTION,
    alternates: { canonical: `${base}/gyms` },
    openGraph: {
      title:       `${title} | ${SITE_NAME}`,
      description: SITE_DESCRIPTION,
      url:         `${base}/gyms`,
      type:        "website",
      locale:      "en_PK",
    },
    robots: { index: true, follow: true },
  };
}

export const revalidate = 3600;

export default async function GymsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Redirect ?city= → /gyms/rawalpindi (preserves other filters)
  const city = params.city as string | undefined;
  if (city) {
    const slug = cityNameToSlug(city);
    if (slug) {
      const sp = new URLSearchParams();
      for (const [key, val] of Object.entries(params)) {
        if (key === "city" || val === undefined) continue;
        if (typeof val === "string") sp.set(key, val);
      }
      const qs = sp.toString();
      permanentRedirect(qs ? `/gyms/${slug}?${qs}` : `/gyms/${slug}`);
    }
  }

  // Redirect ?type= → /gyms/boxing (preserves other filters)
  const type = params.type as string | undefined;
  if (type) {
    const slug = typeValueToSlug(type);
    if (slug) {
      const sp = new URLSearchParams();
      for (const [key, val] of Object.entries(params)) {
        if (key === "type" || val === undefined) continue;
        if (typeof val === "string") sp.set(key, val);
      }
      const qs = sp.toString();
      permanentRedirect(qs ? `/gyms/${slug}?${qs}` : `/gyms/${slug}`);
    }
  }

  return <GymsListingPage searchParams={params} />;
}

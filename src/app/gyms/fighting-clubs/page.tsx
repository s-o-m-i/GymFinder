import type { Metadata } from "next";
import { GymsListingPage } from "@/components/gym/GymsListingPage";
import { FIGHTING_CLUB_TYPE_VALUES } from "@/lib/owner-constants";
import { SITE_NAME } from "@/lib/constants";

const DESCRIPTION =
  "Browse boxing clubs, MMA gyms, Muay Thai, kickboxing, and martial arts academies in Rawalpindi and Islamabad. Compare prices and contact directly on WhatsApp.";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const title = "Fighting Clubs in Rawalpindi & Islamabad";

  return {
    title: `${title} | ${SITE_NAME}`,
    description: DESCRIPTION,
    keywords: [
      "fighting clubs Rawalpindi",
      "fighting clubs Islamabad",
      "boxing clubs twin cities",
      "MMA gyms Pakistan",
    ],
    alternates: { canonical: `${base}/gyms/fighting-clubs` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: DESCRIPTION,
      url: `${base}/gyms/fighting-clubs`,
      type: "website",
      locale: "en_PK",
    },
    robots: { index: true, follow: true },
  };
}

export const revalidate = 3600;

export default async function FightingClubsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <GymsListingPage
      searchParams={params}
      fixedTypes={FIGHTING_CLUB_TYPE_VALUES}
      listingLabel="Fighting Clubs"
      pagePath="/gyms/fighting-clubs"
      seoDescription={DESCRIPTION}
    />
  );
}

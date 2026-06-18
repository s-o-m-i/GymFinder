import type { Metadata } from "next";
import { GymsListingPage } from "@/components/gym/GymsListingPage";
import { generateListingMetadata } from "@/lib/gyms-routes";

const CITY = "Rawalpindi" as const;
const SLUG = "rawalpindi";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  return generateListingMetadata({ slug: SLUG, city: CITY, searchParams: params });
}

export const revalidate = 3600;

export default async function RawalpindiGymsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <GymsListingPage searchParams={params} city={CITY} />;
}

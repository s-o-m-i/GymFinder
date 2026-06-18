import type { Metadata } from "next";
import { GymsListingPage } from "@/components/gym/GymsListingPage";
import { generateListingMetadata } from "@/lib/gyms-routes";

const TYPE = "boxing";
const SLUG = "boxing";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  return generateListingMetadata({ slug: SLUG, type: TYPE, searchParams: params });
}

export const revalidate = 3600;

export default async function BoxingGymsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <GymsListingPage searchParams={params} fixedType={TYPE} />;
}

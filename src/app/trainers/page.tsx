import type { Metadata } from "next";
import { generateTrainersListingMetadata } from "@/lib/trainers-routes";
import { TrainersListingPage } from "@/components/trainers/TrainersListingPage";

export const revalidate = 3600;

export const metadata: Metadata = generateTrainersListingMetadata();

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TrainersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <TrainersListingPage searchParams={params} />;
}

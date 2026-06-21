import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  isTrainerCitySlug,
  TRAINER_CITY_SLUG_MAP,
  generateTrainersListingMetadata,
} from "@/lib/trainers-routes";
import { TrainersListingPage } from "@/components/trainers/TrainersListingPage";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  if (!isTrainerCitySlug(citySlug)) return {};
  const city = TRAINER_CITY_SLUG_MAP[citySlug.toLowerCase()];
  return generateTrainersListingMetadata({ city });
}

export default async function TrainersCityPage({ params, searchParams }: PageProps) {
  const { city: citySlug } = await params;
  if (!isTrainerCitySlug(citySlug)) notFound();

  const city = TRAINER_CITY_SLUG_MAP[citySlug.toLowerCase()];
  const query = await searchParams;

  return <TrainersListingPage searchParams={query} city={city} />;
}

export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EventsListingPage } from "@/components/events/EventsListingPage";
import { cityFromEventSlug, generateEventsListingMetadata } from "@/lib/events-routes";

interface PageProps {
  params: Promise<{ city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = cityFromEventSlug(citySlug);
  if (!city) return { title: "Events Not Found" };

  const sp = await searchParams;
  const time = sp.time === "past" ? "past" : "upcoming";
  return generateEventsListingMetadata({ city, time });
}

export default async function CityEventsPage({ params, searchParams }: PageProps) {
  const { city: citySlug } = await params;
  const city = cityFromEventSlug(citySlug);
  if (!city) notFound();

  const sp = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <EventsListingPage searchParams={sp} city={city} />
    </Suspense>
  );
}

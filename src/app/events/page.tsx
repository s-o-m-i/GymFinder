export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsListingPage } from "@/components/events/EventsListingPage";
import { generateEventsListingMetadata } from "@/lib/events-routes";
import { notFound } from "next/navigation";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const time = params.time === "past" ? "past" : "upcoming";
  return generateEventsListingMetadata({ time });
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <EventsListingPage searchParams={params} />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { EventDetailPage } from "@/components/events/EventDetailPage";
import { generateEventDetailMetadata } from "@/lib/events-routes";
import { getEventBySlug } from "@/services/events/event.service";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };
  return generateEventDetailMetadata(event);
}

export default async function EventSlugPage({ params }: PageProps) {
  const { slug } = await params;
  return <EventDetailPage slug={slug} />;
}

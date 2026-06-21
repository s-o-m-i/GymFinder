import { trackEventView } from "@/services/event-analytics.service";

interface TrackEventViewProps {
  eventId: string;
}

/** Server-side event page view tracking with 24h deduplication */
export async function TrackEventView({ eventId }: TrackEventViewProps) {
  try {
    await trackEventView(eventId);
  } catch {
    // Non-blocking — page render must not fail on analytics errors
  }
  return null;
}

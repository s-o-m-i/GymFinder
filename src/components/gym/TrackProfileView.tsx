import { trackProfileView } from "@/services/analytics.service";

interface TrackProfileViewProps {
  gymId: string;
}

/** Server-side profile view tracking with 24h deduplication */
export async function TrackProfileView({ gymId }: TrackProfileViewProps) {
  try {
    await trackProfileView(gymId);
  } catch {
    // Non-blocking — page render must not fail on analytics errors
  }
  return null;
}
